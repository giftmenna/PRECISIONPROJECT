#!/usr/bin/env python3
"""Clean and fix the group chat control page"""

# Read the entire file
with open('pre/src/app/admin/group-chat/control/page.tsx', 'r') as f:
    content = f.read()

# Find the position where duplication starts (around line 609)
# Remove lines 609-610 which are orphaned closing tags
lines = content.split('\n')

# Track which lines to keep
keep_lines = []
skip_next_n = 0

for i, line in enumerate(lines):
    line_num = i + 1
    
    # Skip lines we've marked to skip
    if skip_next_n > 0:
        skip_next_n -= 1
        continue
    
    # Remove orphaned </CardHeader> and </Card> after line 608
    if line_num == 609 and '</CardHeader>' in line:
        skip_next_n = 1  # Skip this and next line
        # Add proper closing and opening
        keep_lines.append('\t\t\t</div>')
        keep_lines.append('')
        keep_lines.append('\t\t\t{/* Active Members - Only show when group is selected */}')
        keep_lines.append('\t\t\t{selectedGroup && (')
        continue
    
    # Remove duplicate CardHeader/CardContent sections (lines 636-670)
    if line_num >= 636 and line_num <= 670 and ('CardHeader' in line or 'CardContent' in line or 'selectedGroup.members.filter' in line):
        if line_num == 636:
            # Skip the duplicate section
            skip_next_n = 34
        continue
    
    # Close the conditional rendering properly before Messages section
    if line_num == 671 and 'Button' in line:
        keep_lines.append('\t\t\t\t\t\t\t\t\t\t</div>')
        keep_lines.append('\t\t\t\t\t\t\t\t\t</div>')
        keep_lines.append('\t\t\t\t\t\t\t\t</div>')
        keep_lines.append('\t\t\t\t\t\t\t))}')
        keep_lines.append('\t\t\t\t\t\t</div>')
        keep_lines.append('\t\t\t\t\t)}')
        keep_lines.append('\t\t\t\t</CardContent>')
        keep_lines.append('\t\t\t</Card>')
        keep_lines.append('\t\t\t)}')
        keep_lines.append('')
    
    keep_lines.append(line)

# Write the cleaned file
with open('pre/src/app/admin/group-chat/control/page.tsx', 'w') as f:
    f.write('\n'.join(keep_lines))

print(f"File cleaned! Removed duplicates and fixed structure.")
print(f"Original lines: {len(lines)}, New lines: {len(keep_lines)}")
