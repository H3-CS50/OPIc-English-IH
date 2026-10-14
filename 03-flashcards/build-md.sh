#!/bin/sh
# Tạo lại flashcards.md từ anki-opic-ih.tsv
cd "$(dirname "$0")"
sed -n '1,/^|---|/p' flashcards.md > flashcards.tmp
grep -v '^#' anki-opic-ih.tsv | awk -F'\t' '{printf "| %d | %s | **%s** | %s |\n", NR, $1, $2, $3}' >> flashcards.tmp
mv flashcards.tmp flashcards.md
