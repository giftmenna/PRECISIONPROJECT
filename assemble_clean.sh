#!/bin/bash

FILE="pre/src/app/admin/group-chat/control/page.tsx"
BROKEN="pre/src/app/admin/group-chat/control/page.tsx.broken"

# Take clean sections and assemble
{
    # Lines 1-236: All imports, state, and functions (CLEAN)
    sed -n '1,236p' "$BROKEN"
    
    # Lines 237-450: Most of the render logic (mostly clean, skip duplicates)
    sed -n '237,450p' "$BROKEN" | sed '/^[[:space:]]*<CardHeader>/,/^[[:space:]]*<\/CardContent>/{ /CardHeader/,/CardContent/{/selectedGroup\.members\.filter.*!m\.is_banned/d; /CardHeader>/{ N; /CardHeader>.*CardTitle/{ N; N; N; N; d; }; }; }; }'
    
    # Lines 560-900: Rest of the UI and modals (CLEAN)
    sed -n '560,900p' "$BROKEN"
    
    # Last line
    echo "}"
    
} > "$FILE"

echo "Assembled clean file from working sections"
wc -l "$FILE"
