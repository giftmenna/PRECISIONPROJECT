#!/usr/bin/env python3
"""Fix the corrupted group chat control page"""

# Read the file
with open('pre/src/app/admin/group-chat/control/page.tsx', 'r') as f:
    lines = f.readlines()

# Find and fix the broken section (around line 487-502)
fixed_lines = []
skip_until = -1

for i, line in enumerate(lines, 1):
    # Skip duplicate/broken sections
    if skip_until > 0 and i <= skip_until:
        continue
    
    # Fix the broken group list section
    if i == 487 and 'members' in line and '</p>' not in line:
        # Add the missing closing tag
        fixed_lines.append(line.rstrip() + '\n')
        fixed_lines.append('\t\t\t\t\t\t\t\t\t\t\t\t\t</p>\n')
        continue
    
    # Fix the button that references undefined 'member' variable
    if i >= 490 and i <= 500 and 'banUser(member' in line:
        # Skip this broken button section and replace with delete button
        if i == 490:
            fixed_lines.append('\t\t\t\t\t\t\t\t\t\t\t\t<Button\n')
            fixed_lines.append('\t\t\t\t\t\t\t\t\t\t\t\t\tvariant="ghost"\n')
            fixed_lines.append('\t\t\t\t\t\t\t\t\t\t\t\t\tsize="sm"\n')
            fixed_lines.append('\t\t\t\t\t\t\t\t\t\t\t\t\tonClick={(e) => {\n')
            fixed_lines.append('\t\t\t\t\t\t\t\t\t\t\t\t\t\te.stopPropagation();\n')
            fixed_lines.append('\t\t\t\t\t\t\t\t\t\t\t\t\t\tinitiateDeleteGroup(group.id, group.name);\n')
            fixed_lines.append('\t\t\t\t\t\t\t\t\t\t\t\t\t}}\n')
            fixed_lines.append('\t\t\t\t\t\t\t\t\t\t\t\t\tclassName="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"\n')
            fixed_lines.append('\t\t\t\t\t\t\t\t\t\t\t\t>\n')
            fixed_lines.append('\t\t\t\t\t\t\t\t\t\t\t\t\t<Trash2 className="h-4 w-4" />\n')
            fixed_lines.append('\t\t\t\t\t\t\t\t\t\t\t\t</Button>\n')
            fixed_lines.append('\t\t\t\t\t\t\t\t\t\t\t</div>\n')
            fixed_lines.append('\t\t\t\t\t\t\t\t\t\t</div>\n')
            skip_until = 500
        continue
    
    # Remove duplicate Card sections (lines 517-522)
    if i >= 517 and i <= 522 and 'Banned Members' in line:
        skip_until = 522
        continue
    
    fixed_lines.append(line)

# Write the fixed file
with open('pre/src/app/admin/group-chat/control/page.tsx', 'w') as f:
    f.writelines(fixed_lines)

print("File fixed successfully!")
