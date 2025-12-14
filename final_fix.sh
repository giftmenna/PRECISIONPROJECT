#!/bin/bash
# Final fix for the control page - remove only the problematic duplicate sections

FILE="pre/src/app/admin/group-chat/control/page.tsx"

# Create a backup
cp "$FILE" "${FILE}.prefinal"

# Use awk to remove specific duplicate sections
awk '
BEGIN { skip = 0; in_duplicate = 0 }

# Skip orphaned closing tags at lines 609-610
NR == 609 && /CardHeader/ { 
    print "\t\t\t</div>"
    print ""
    print "\t\t\t{selectedGroup && ("
    skip = 2
    next
}

# Skip duplicate CardHeader/CardContent section (lines 636-670)
NR >= 636 && NR <= 670 && (/<CardHeader>/ || /<CardContent>/ || /selectedGroup\.members\.filter/) {
    if (NR == 636) {
        in_duplicate = 1
    }
    if (in_duplicate) {
        next
    }
}

NR == 671 {
    if (in_duplicate) {
        print "\t\t\t\t\t\t\t\t\t\t</div>"
        print "\t\t\t\t\t\t\t\t\t</div>"
        print "\t\t\t\t\t\t\t\t</div>"
        print "\t\t\t\t\t\t\t))}}"
        print "\t\t\t\t\t\t</div>"
        print "\t\t\t\t\t)}}"
        print "\t\t\t\t</CardContent>"
        print "\t\t\t</Card>"
        print "\t\t\t)}}"
        print ""
        in_duplicate = 0
    }
}

skip > 0 { skip--; next }

{ print }
' "${FILE}.prefinal" > "$FILE"

echo "Fix applied! Check the file."
