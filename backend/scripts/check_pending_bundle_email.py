import os
import smtplib
from datetime import datetime, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from config import db

BUNDLES_COLLECTION = "bundles"

def check_and_notify_pending_bundle():
    """
    Verifica se o bundle da semana atual está publicado.
    Se não estiver, envia um e-mail de alerta.
    Pode ser executado via CronJob ou Scheduler.
    """
    now = datetime.now(timezone.utc)
    current_year, current_week, current_weekday = now.isocalendar()

    # Busca bundles ativos ou cadastrados para a semana atual
    bundles_ref = db.collection(BUNDLES_COLLECTION)
    query = bundles_ref.where("week_number", "==", current_week).stream()
    
    published_bundle = None
    for doc in query:
        data = doc.to_dict()
        if data.get("is_active"):
            published_bundle = data
            break

    if published_bundle:
        print(f"✅ Bundle da semana {current_week} já publicado: {published_bundle.get('title')}")
        return

    print(f"⚠️ Alerta: Nenhum bundle publicado encontrado para a semana {current_week} ({current_year}). Enviando e-mail...")
    send_warning_email(current_week, current_year)

def send_warning_email(week_number: int, year: int):
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_password = os.getenv("SMTP_PASSWORD", "")
    notification_email = os.getenv("NOTIFICATION_EMAIL", smtp_user)

    if not smtp_user or not smtp_password:
        print("❌ Variáveis de ambiente SMTP_USER e SMTP_PASSWORD não configuradas. E-mail de aviso não enviado.")
        return

    subject = f"⚠️ Lembrete Lamed: Bundle da Semana {week_number} não publicado!"
    body = f"""
    Olá!

    Este é um lembrete automático do sistema Lamed.

    Identificamos que até o momento o **Bundle da Semana {week_number} ({year})** ainda NÃO foi publicado ou ativado no Painel Admin.

    📌 **Ações recomendadas:**
    1. Acesse o Painel Admin do Lamed.
    2. Vincule o vídeo principal do YouTube e os materiais de apoio.
    3. Altere o status do Bundle para **Ativo / Publicado**.

    Acesse o painel: https://lamed148.com.br/admin

    -- 
    Equipe Lamed Automated System
    """

    msg = MIMEMultipart()
    msg['From'] = smtp_user
    msg['To'] = notification_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.send_message(msg)
        server.quit()
        print(f"✉️ E-mail de alerta enviado com sucesso para {notification_email}")
    except Exception as e:
        print(f"❌ Erro ao enviar e-mail de alerta: {e}")

if __name__ == "__main__":
    check_and_notify_pending_bundle()
