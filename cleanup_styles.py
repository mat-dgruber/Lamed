import os

file_path = r'c:\Users\PC Cabuloso\Documents\GitHub\Novo_Lamed_Angular\frontend\src\styles.scss'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if '/* Dark Mode Colors */' in line:
        skip = True
        continue
    if skip and line.strip() == '}':
        skip = False
        continue
    if skip:
        continue
        
    if '/* Dark Mode Styles */' in line:
        skip = True
        continue
    if skip and '/* Theme Toggle Button */' in line:
        # We want to continue skipping through theme toggle
        continue
    if skip and line.strip() == 'a {':
        skip = False
        new_lines.append(line)
        continue
    if skip:
        continue
        
    new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Cleanup complete")
