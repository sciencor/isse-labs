# ===== Encoding: avoid mojibake =====
[Console]::InputEncoding  = [Text.UTF8Encoding]::new()
[Console]::OutputEncoding = [Text.UTF8Encoding]::new()
chcp 65001 | Out-Null

$BASE = "http://localhost:5000/api"

function Send-CurlJson {
    param(
        [ValidateSet("GET","POST","PATCH","DELETE")] [string]$Method,
        [string]$Url,
        $BodyObj = $null,
        [switch]$Quiet
    )
    $args = @("-sS","--fail","-X",$Method,$Url,"-H","Content-Type: application/json")
    $tmp = $null
    if ($null -ne $BodyObj) {
        $json = $BodyObj | ConvertTo-Json -Compress -Depth 10
        $tmp  = [IO.Path]::GetTempFileName()
        [IO.File]::WriteAllText($tmp, $json, [Text.UTF8Encoding]::new($false))  # UTF-8 without BOM
        $args += @("--data-binary","@$tmp")
    }
    try {
        $raw = & curl.exe @args
        $obj = $null
        try { $obj = $raw | ConvertFrom-Json } catch { $obj = $raw }
        if (-not $Quiet) { $obj | ConvertTo-Json -Depth 20 | Write-Host }
        return $obj
    } finally {
        if ($tmp -and (Test-Path $tmp)) { Remove-Item $tmp -Force -ErrorAction SilentlyContinue }
    }
}

Write-Host "=== 0) List all (service ready check) ==="
# expect: {"ok": true, "data": [...]}
$resp0 = Send-CurlJson GET "$BASE/todos"

Write-Host "`n=== 1) Create todo #1 (high, work, with due_date) ==="
# expect: {"ok": true, "data": {"title":"Finish report","priority":"high","category":"work","completed":false,"due_date":"2025-10-24T12:00:00Z","id":"..."}}
$resp1 = Send-CurlJson POST "$BASE/todos" @{
    title    = "Finish report"
    priority = "high"
    category = "work"
    due_date = "2025-10-24T12:00:00Z"
}
$ID1 = $resp1.data.id

Write-Host "`n=== 2) Create todo #2 (low, life, no due_date) ==="
# expect: {"ok": true, "data": {"title":"Buy milk","priority":"low","category":"life","completed":false,"due_date":null,"id":"..."}}
$resp2 = Send-CurlJson POST "$BASE/todos" @{
    title    = "Buy milk"
    priority = "low"
    category = "life"
}
$ID2 = $resp2.data.id

Write-Host "`n=== 3) Create todo #3 (medium, study, completed=false) ==="
# expect: {"ok": true, "data": {"title":"Read book","priority":"medium","category":"study","completed":false,"due_date":null,"id":"..."}}
$resp3 = Send-CurlJson POST "$BASE/todos" @{
    title     = "Read book"
    priority  = "medium"
    category  = "study"
    completed = $false
}
$ID3 = $resp3.data.id

Write-Host "`n=== 4) Create todo #4 (medium, life, with due_date) ==="
# expect: {"ok": true, "data": {"title":"Call Alice","priority":"medium","category":"life","completed":false,"due_date":"2025-11-01T18:30:00Z","id":"..."}}
$resp4 = Send-CurlJson POST "$BASE/todos" @{
    title    = "Call Alice"
    priority = "medium"
    category = "life"
    due_date = "2025-11-01T18:30:00Z"
}
$ID4 = $resp4.data.id

Write-Host "`n=== 5) List all ==="
# expect: 4 items including above ones
$all1 = Send-CurlJson GET "$BASE/todos"

Write-Host "`n=== 6) Filter by category=life ==="
# expect: only life items (Buy milk, Call Alice)
$byCat = Send-CurlJson GET "$BASE/todos?category=life"

Write-Host "`n=== 7) Filter by priority=high ==="
# expect: only high priority (Finish report)
$byPrio = Send-CurlJson GET "$BASE/todos?priority=high"

Write-Host "`n=== 8) Filter by completed=false ==="
# expect: items with completed=false
$byCompFalse = Send-CurlJson GET "$BASE/todos?completed=false"

Write-Host "`n=== 9) Keyword search q=book (title/category) ==="
# expect: items containing 'book' (Read book)
$byKeyword = Send-CurlJson GET "$BASE/todos?q=book"

Write-Host "`n=== 10) PATCH: mark todo #2 completed=true ==="
# expect: {"ok": true, "data": {"id":$ID2,"completed":true,...}}
$patchCompleted = Send-CurlJson PATCH "$BASE/todos/$ID2" @{ completed = $true }

Write-Host "`n=== 11) Verify completed=true filter now includes #2 ==="
$byCompTrue = Send-CurlJson GET "$BASE/todos?completed=true"

Write-Host "`n=== 12) PATCH: update #1 title and category ==="
# expect: title -> "Finish quarterly report", category -> "work-urgent"
$patchTitleCat = Send-CurlJson PATCH "$BASE/todos/$ID1" @{
    title    = "Finish quarterly report"
    category = "work-urgent"
}

Write-Host "`n=== 13) PATCH: update #4 priority=high and due_date ==="
# expect: priority=high, due_date updated
$patchPrioDue = Send-CurlJson PATCH "$BASE/todos/$ID4" @{
    priority = "high"
    due_date = "2025-11-02T09:00:00Z"
}

Write-Host "`n=== 14) List all to confirm updates ==="
$all2 = Send-CurlJson GET "$BASE/todos"

Write-Host "`n=== 15) DELETE: remove #3 ==="
# expect: {"ok": true, "data": {"id": $ID3}}
$del3 = Send-CurlJson DELETE "$BASE/todos/$ID3"

Write-Host "`n=== 16) List all to confirm deletion ==="
$all3 = Send-CurlJson GET "$BASE/todos"

Write-Host "`n=== 17) Neg test: PATCH invalid priority (expect HTTP 400) ==="
try {
    Send-CurlJson PATCH "$BASE/todos/$ID1" @{ priority = "urgent" } -Quiet
    Write-Host "Unexpected success"
} catch {
    Write-Host ("HTTP 4xx expected: " + $_.Exception.Message)
}

Write-Host "`n=== 18) Neg test: DELETE non-existent ID (expect HTTP 404) ==="
try {
    Send-CurlJson DELETE "$BASE/todos/00000000-0000-0000-0000-000000000000" -Quiet
    Write-Host "Unexpected success"
} catch {
    Write-Host ("HTTP 4xx expected: " + $_.Exception.Message)
}

Write-Host "`nDone."
