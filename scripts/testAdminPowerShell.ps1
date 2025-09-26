# سكربت PowerShell لاختبار النظام الإداري
# استخدم هذا الملف لاختبار التحديثات الإدارية بسهولة

# تأكد من تعيين متغيرات البيئة
$envFile = ".env.local"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
}

# متغيرات الاختبار
$baseUrl = "http://localhost:3000"
$adminToken = $env:ADMIN_MUTATION_TOKEN

if (-not $adminToken) {
    Write-Host "❌ ADMIN_MUTATION_TOKEN غير محدد" -ForegroundColor Red
    Write-Host "أضف التوكن إلى ملف .env.local" -ForegroundColor Yellow
    exit 1
}

# دالة لإرسال طلب تحديث
function Update-AdminRecord {
    param(
        [string]$Table,
        [string]$Id,
        [hashtable]$Patch,
        [bool]$ReturnAll = $true
    )
    
    $body = @{
        table = $Table
        id = $Id
        patch = $Patch
        returnAll = $ReturnAll
    } | ConvertTo-Json -Depth 3
    
    $headers = @{
        "Content-Type" = "application/json"
        "x-admin-token" = $adminToken
    }
    
    Write-Host "🔧 تحديث $Table[$Id]..." -ForegroundColor Cyan
    Write-Host "📝 البيانات: $($Patch | ConvertTo-Json -Compress)" -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Method Post "$baseUrl/api/admin/update" -Headers $headers -Body $body
        
        Write-Host "✅ نجح التحديث!" -ForegroundColor Green
        Write-Host "📊 النتيجة:" -ForegroundColor Yellow
        $response | ConvertTo-Json -Depth 3 | Write-Host
        
    } catch {
        Write-Host "❌ فشل التحديث" -ForegroundColor Red
        Write-Host "📋 الخطأ: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($_.Exception.Response) {
            $errorBody = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorBody)
            $errorContent = $reader.ReadToEnd()
            Write-Host "📝 التفاصيل: $errorContent" -ForegroundColor Red
        }
    }
    
    Write-Host ""
}

# أمثلة للاختبار
Write-Host "🚀 أمثلة اختبار النظام الإداري" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""

# مثال 1: تحديث بروفايل
Write-Host "📋 مثال 1: تحديث بروفايل" -ForegroundColor Cyan
Update-AdminRecord -Table "profiles" -Id "00000000-0000-0000-0000-000000000000" -Patch @{
    "first_name" = "عبدالله"
    "last_name" = "الرشيد"
    "city" = "الرياض"
    "is_verified" = $true
}

# مثال 2: تحديث رسالة دردشة
Write-Host "📋 مثال 2: تحديث رسالة دردشة" -ForegroundColor Cyan
Update-AdminRecord -Table "chat_messages" -Id "11111111-1111-1111-1111-111111111111" -Patch @{
    "is_flagged" = $true
    "flag_reason" = "محتوى غير مناسب"
    "moderated_at" = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
}

# مثال 3: تحديث حالة مباراة
Write-Host "📋 مثال 3: تحديث حالة مباراة" -ForegroundColor Cyan
Update-AdminRecord -Table "matches" -Id "22222222-2222-2222-2222-222222222222" -Patch @{
    "status" = "completed"
    "completion_date" = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
}

Write-Host "🎯 انتهى الاختبار!" -ForegroundColor Green
Write-Host "لتشغيل اختبارات مخصصة، استخدم:" -ForegroundColor Yellow
Write-Host "Update-AdminRecord -Table 'table_name' -Id 'uuid' -Patch @{ 'field' = 'value' }" -ForegroundColor Gray


