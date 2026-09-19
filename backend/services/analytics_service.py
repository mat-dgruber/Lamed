import os
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

class AnalyticsService:
    def __init__(self):
        self.property_id = os.getenv("GA_PROPERTY_ID", "").strip()
        self._client = None
        self._client_initialized = False

    def _get_client(self):
        if self._client_initialized:
            return self._client
        
        try:
            from google.analytics.data_v1beta import BetaAnalyticsDataClient
            # If key_path exists in backend/certs/serviceAccountKey.json
            key_path = os.path.join(os.path.dirname(__file__), "..", "certs", "serviceAccountKey.json")
            if os.path.exists(key_path):
                self._client = BetaAnalyticsDataClient.from_service_account_file(key_path)
            else:
                # Use Application Default Credentials (ADC)
                self._client = BetaAnalyticsDataClient()
            self._client_initialized = True
            return self._client
        except Exception as e:
            logger.warning("Could not initialize Google Analytics Data client: %s", e)
            self._client_initialized = True
            self._client = None
            return None

    def is_configured(self) -> bool:
        return bool(self.property_id and self._get_client() is not None)

    def get_overview(self, days: int = 30) -> Dict[str, Any]:
        if not self.is_configured():
            return {
                "configured": False,
                "property_id": self.property_id,
                "message": "Google Analytics Data API não configurada. Configure a variável GA_PROPERTY_ID no backend.",
                "summary": {
                    "active_users": 1420,
                    "active_users_prev": 1180,
                    "active_users_growth": 20.3,
                    "sessions": 2890,
                    "sessions_prev": 2450,
                    "sessions_growth": 17.9,
                    "page_views": 8750,
                    "page_views_prev": 7300,
                    "page_views_growth": 19.8,
                    "avg_duration_seconds": 185,
                    "bounce_rate": 38.5,
                }
            }

        try:
            from google.analytics.data_v1beta.types import (
                DateRange,
                Metric,
                RunReportRequest,
            )
            client = self._get_client()

            # 1. Current period report
            request = RunReportRequest(
                property=f"properties/{self.property_id}",
                date_ranges=[
                    DateRange(start_date=f"{days}daysAgo", end_date="today"),
                    DateRange(start_date=f"{days * 2}daysAgo", end_date=f"{days + 1}daysAgo"),
                ],
                metrics=[
                    Metric(name="activeUsers"),
                    Metric(name="sessions"),
                    Metric(name="screenPageViews"),
                    Metric(name="averageSessionDuration"),
                    Metric(name="bounceRate"),
                ],
            )
            response = client.run_report(request)

            curr_row = response.rows[0].metric_values if len(response.rows) > 0 else []
            prev_row = response.rows[1].metric_values if len(response.rows) > 1 else []

            curr_users = int(curr_row[0].value) if len(curr_row) > 0 else 0
            prev_users = int(prev_row[0].value) if len(prev_row) > 0 else 0
            users_growth = round(((curr_users - prev_users) / prev_users) * 100, 1) if prev_users else 0.0

            curr_sessions = int(curr_row[1].value) if len(curr_row) > 1 else 0
            prev_sessions = int(prev_row[1].value) if len(prev_row) > 1 else 0
            sessions_growth = round(((curr_sessions - prev_sessions) / prev_sessions) * 100, 1) if prev_sessions else 0.0

            curr_views = int(curr_row[2].value) if len(curr_row) > 2 else 0
            prev_views = int(prev_row[2].value) if len(prev_row) > 2 else 0
            views_growth = round(((curr_views - prev_views) / prev_views) * 100, 1) if prev_views else 0.0

            avg_duration = round(float(curr_row[3].value)) if len(curr_row) > 3 else 0
            bounce_rate = round(float(curr_row[4].value) * 100, 1) if len(curr_row) > 4 else 0.0

            return {
                "configured": True,
                "property_id": self.property_id,
                "summary": {
                    "active_users": curr_users,
                    "active_users_prev": prev_users,
                    "active_users_growth": users_growth,
                    "sessions": curr_sessions,
                    "sessions_prev": prev_sessions,
                    "sessions_growth": sessions_growth,
                    "page_views": curr_views,
                    "page_views_prev": prev_views,
                    "page_views_growth": views_growth,
                    "avg_duration_seconds": avg_duration,
                    "bounce_rate": bounce_rate,
                }
            }
        except Exception as e:
            logger.error("Error fetching GA overview: %s", e)
            return {
                "configured": False,
                "property_id": self.property_id,
                "error": str(e),
                "summary": {
                    "active_users": 0,
                    "sessions": 0,
                    "page_views": 0,
                    "avg_duration_seconds": 0,
                    "bounce_rate": 0.0
                }
            }

    def get_realtime(self) -> Dict[str, Any]:
        if not self.is_configured():
            return {
                "configured": False,
                "active_users_now": 7,
                "top_active_pages": [
                    {"path": "/artigos", "users": 3},
                    {"path": "/", "users": 2},
                    {"path": "/videos", "users": 2},
                ]
            }

        try:
            from google.analytics.data_v1beta.types import (
                Metric,
                Dimension,
                RunRealtimeReportRequest,
            )
            client = self._get_client()
            request = RunRealtimeReportRequest(
                property=f"properties/{self.property_id}",
                dimensions=[Dimension(name="unifiedScreenName")],
                metrics=[Metric(name="activeUsers")],
            )
            response = client.run_realtime_report(request)

            total_now = 0
            pages = []
            for row in response.rows:
                users = int(row.metric_values[0].value)
                total_now += users
                pages.append({
                    "path": row.dimension_values[0].value,
                    "users": users
                })

            return {
                "configured": True,
                "active_users_now": total_now,
                "top_active_pages": pages[:5]
            }
        except Exception as e:
            logger.error("Error fetching realtime analytics: %s", e)
            return {
                "configured": False,
                "error": str(e),
                "active_users_now": 0,
                "top_active_pages": []
            }

    def get_top_content(self, limit: int = 10, days: int = 30) -> List[Dict[str, Any]]:
        if not self.is_configured():
            return [
                {"path": "/artigos/a-promessa-da-alianca", "title": "A Promessa da Aliança e a Fé de Abraão", "views": 2450, "users": 1820},
                {"path": "/videos", "title": "Estudos Bíblicos e Vídeos Expositivos", "views": 1940, "users": 1410},
                {"path": "/", "title": "Lamed — Página Inicial", "views": 1880, "users": 1390},
                {"path": "/artigos", "title": "Artigos Teológicos e Doutrinários", "views": 1320, "users": 980},
                {"path": "/sobre", "title": "Sobre o Ministério Lamed", "views": 840, "users": 650},
            ]

        try:
            from google.analytics.data_v1beta.types import (
                DateRange,
                Dimension,
                Metric,
                OrderBy,
                RunReportRequest,
            )
            client = self._get_client()
            request = RunReportRequest(
                property=f"properties/{self.property_id}",
                date_ranges=[DateRange(start_date=f"{days}daysAgo", end_date="today")],
                dimensions=[
                    Dimension(name="pagePath"),
                    Dimension(name="pageTitle"),
                ],
                metrics=[
                    Metric(name="screenPageViews"),
                    Metric(name="activeUsers"),
                ],
                order_bys=[
                    OrderBy(metric=OrderBy.MetricOrderBy(metric_name="screenPageViews"), desc=True)
                ],
                limit=limit,
            )
            response = client.run_report(request)

            result = []
            for row in response.rows:
                result.append({
                    "path": row.dimension_values[0].value,
                    "title": row.dimension_values[1].value,
                    "views": int(row.metric_values[0].value),
                    "users": int(row.metric_values[1].value),
                })
            return result
        except Exception as e:
            logger.error("Error fetching top content: %s", e)
            return []

    def get_traffic_sources(self, days: int = 30) -> List[Dict[str, Any]]:
        if not self.is_configured():
            return [
                {"source": "Google Busca Orgânica", "sessions": 1420, "percentage": 49.1},
                {"source": "YouTube (Canal Lamed)", "sessions": 830, "percentage": 28.7},
                {"source": "Acesso Direto", "sessions": 410, "percentage": 14.2},
                {"source": "Redes Sociais & Links", "sessions": 230, "percentage": 8.0},
            ]

        try:
            from google.analytics.data_v1beta.types import (
                DateRange,
                Dimension,
                Metric,
                OrderBy,
                RunReportRequest,
            )
            client = self._get_client()
            request = RunReportRequest(
                property=f"properties/{self.property_id}",
                date_ranges=[DateRange(start_date=f"{days}daysAgo", end_date="today")],
                dimensions=[Dimension(name="sessionDefaultChannelGroup")],
                metrics=[Metric(name="sessions"), Metric(name="activeUsers")],
                order_bys=[
                    OrderBy(metric=OrderBy.MetricOrderBy(metric_name="sessions"), desc=True)
                ],
                limit=5,
            )
            response = client.run_report(request)

            total_sessions = sum(int(r.metric_values[0].value) for r in response.rows) or 1
            result = []
            for row in response.rows:
                sessions = int(row.metric_values[0].value)
                pct = round((sessions / total_sessions) * 100, 1)
                result.append({
                    "source": row.dimension_values[0].value,
                    "sessions": sessions,
                    "percentage": pct
                })
            return result
        except Exception as e:
            logger.error("Error fetching traffic sources: %s", e)
            return []

analytics_service = AnalyticsService()
