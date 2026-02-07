import sys

orig_file = r'c:\Users\PC Cabuloso\Documents\GitHub\Novo_Lamed_Angular\frontend\src\styles.scss'
temp_file = r'c:\Users\PC Cabuloso\Documents\GitHub\Novo_Lamed_Angular\frontend\src\styles.scss.tmp'

with open(orig_file, 'r', encoding='utf-8') as fin, open(temp_file, 'w', encoding='utf-8') as fout:
    skip = False
    for line in fin:
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
            continue
        if skip and line.strip() == 'a {':
            skip = False
            fout.write(line)
            continue
        if skip:
            continue
            
        fout.write(line)

import os
os.replace(temp_file, orig_file)
print("SUCCESS")
