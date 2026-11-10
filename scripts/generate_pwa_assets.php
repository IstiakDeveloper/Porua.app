<?php

$publicPath = __DIR__ . '/../public';
$logoPath = $publicPath . '/logo.png';

if (!file_exists($logoPath)) {
    die("Error: logo.png not found at {$logoPath}\n");
}

$iconsDir = $publicPath . '/pwa/icons';
$screenshotsDir = $publicPath . '/pwa/screenshots';

if (!is_dir($iconsDir)) {
    mkdir($iconsDir, 0755, true);
}
if (!is_dir($screenshotsDir)) {
    mkdir($screenshotsDir, 0755, true);
}

// Load source logo
$sourceImg = imagecreatefrompng($logoPath);
imagealphablending($sourceImg, true);
imagesavealpha($sourceImg, true);

$srcW = imagesx($sourceImg);
$srcH = imagesy($sourceImg);
echo "Source Logo: {$srcW}x{$srcH}\n";

// 1. Standard Icons
$standardSizes = [72, 96, 128, 144, 152, 192, 384, 512];
foreach ($standardSizes as $size) {
    $targetImg = imagecreatetruecolor($size, $size);
    imagealphablending($targetImg, false);
    imagesavealpha($targetImg, true);
    $transparent = imagecolorallocatealpha($targetImg, 255, 255, 255, 127);
    imagefilledrectangle($targetImg, 0, 0, $size, $size, $transparent);
    imagealphablending($targetImg, true);

    // Maintain aspect ratio centered
    $scale = min($size / $srcW, $size / $srcH);
    $newW = (int) round($srcW * $scale);
    $newH = (int) round($srcH * $scale);
    $dstX = (int) round(($size - $newW) / 2);
    $dstY = (int) round(($size - $newH) / 2);

    imagecopyresampled($targetImg, $sourceImg, $dstX, $dstY, 0, 0, $newW, $newH, $srcW, $srcH);
    imagepng($targetImg, "{$iconsDir}/icon-{$size}x{$size}.png", 9);
    imagedestroy($targetImg);
    echo "Generated: icon-{$size}x{$size}.png\n";
}

// 2. Favicons
foreach ([16, 32] as $size) {
    $targetImg = imagecreatetruecolor($size, $size);
    imagealphablending($targetImg, false);
    imagesavealpha($targetImg, true);
    $transparent = imagecolorallocatealpha($targetImg, 255, 255, 255, 127);
    imagefilledrectangle($targetImg, 0, 0, $size, $size, $transparent);
    imagealphablending($targetImg, true);

    $scale = min($size / $srcW, $size / $srcH);
    $newW = (int) round($srcW * $scale);
    $newH = (int) round($srcH * $scale);
    $dstX = (int) round(($size - $newW) / 2);
    $dstY = (int) round(($size - $newH) / 2);

    imagecopyresampled($targetImg, $sourceImg, $dstX, $dstY, 0, 0, $newW, $newH, $srcW, $srcH);
    imagepng($targetImg, "{$iconsDir}/favicon-{$size}x{$size}.png", 9);
    imagedestroy($targetImg);
    echo "Generated: favicon-{$size}x{$size}.png\n";
}

// 3. Apple Touch Icon (180x180)
$appleSize = 180;
$appleImg = imagecreatetruecolor($appleSize, $appleSize);
$white = imagecolorallocate($appleImg, 255, 255, 255);
imagefilledrectangle($appleImg, 0, 0, $appleSize, $appleSize, $white);
$appleScale = min(($appleSize * 0.8) / $srcW, ($appleSize * 0.8) / $srcH);
$newW = (int) round($srcW * $appleScale);
$newH = (int) round($srcH * $appleScale);
$dstX = (int) round(($appleSize - $newW) / 2);
$dstY = (int) round(($appleSize - $newH) / 2);
imagecopyresampled($appleImg, $sourceImg, $dstX, $dstY, 0, 0, $newW, $newH, $srcW, $srcH);
imagepng($appleImg, "{$iconsDir}/apple-touch-icon.png", 9);
imagepng($appleImg, "{$publicPath}/apple-touch-icon.png", 9); // also update root
imagedestroy($appleImg);
echo "Generated: apple-touch-icon.png\n";

// 4. Maskable Icons (192x192 & 512x512 with safe padding & #4F46E5 brand background)
foreach ([192, 512] as $size) {
    $maskImg = imagecreatetruecolor($size, $size);
    // Indigo-600 background #4f46e5
    $bgColor = imagecolorallocate($maskImg, 79, 70, 229);
    imagefilledrectangle($maskImg, 0, 0, $size, $size, $bgColor);

    // Draw white circle plate for high contrast
    $whitePlate = imagecolorallocate($maskImg, 255, 255, 255);
    $plateRadius = (int) round($size * 0.8);
    imagefilledellipse($maskImg, (int) round($size / 2), (int) round($size / 2), $plateRadius, $plateRadius, $whitePlate);

    // Inner logo scaled inside safe area (60% of canvas)
    $maskScale = min(($size * 0.6) / $srcW, ($size * 0.6) / $srcH);
    $newW = (int) round($srcW * $maskScale);
    $newH = (int) round($srcH * $maskScale);
    $dstX = (int) round(($size - $newW) / 2);
    $dstY = (int) round(($size - $newH) / 2);

    imagecopyresampled($maskImg, $sourceImg, $dstX, $dstY, 0, 0, $newW, $newH, $srcW, $srcH);
    imagepng($maskImg, "{$iconsDir}/icon-maskable-{$size}x{$size}.png", 9);
    imagedestroy($maskImg);
    echo "Generated: icon-maskable-{$size}x{$size}.png\n";
}

// 5. Monochrome Badge (96x96)
$badgeImg = imagecreatetruecolor(96, 96);
imagealphablending($badgeImg, false);
imagesavealpha($badgeImg, true);
$transparent = imagecolorallocatealpha($badgeImg, 255, 255, 255, 127);
imagefilledrectangle($badgeImg, 0, 0, 96, 96, $transparent);
imagealphablending($badgeImg, true);

$badgeScale = min((96 * 0.8) / $srcW, (96 * 0.8) / $srcH);
$newW = (int) round($srcW * $badgeScale);
$newH = (int) round($srcH * $badgeScale);
$dstX = (int) round((96 - $newW) / 2);
$dstY = (int) round((96 - $newH) / 2);

imagecopyresampled($badgeImg, $sourceImg, $dstX, $dstY, 0, 0, $newW, $newH, $srcW, $srcH);
// Filter to monochrome white silhouette
imagefilter($badgeImg, IMG_FILTER_BRIGHTNESS, 255);
imagepng($badgeImg, "{$iconsDir}/badge-96x96.png", 9);
imagedestroy($badgeImg);
echo "Generated: badge-96x96.png\n";

// ==========================================
// 6. SCREENSHOTS GENERATION (WITH BRANDED LOGO)
// ==========================================

// Helper function to draw rounded rectangle
function drawRoundedRect($img, $x1, $y1, $x2, $y2, $radius, $color) {
    imagefilledrectangle($img, $x1 + $radius, $y1, $x2 - $radius, $y2, $color);
    imagefilledrectangle($img, $x1, $y1 + $radius, $x2, $y2 - $radius, $color);
    imagefilledellipse($img, $x1 + $radius, $y1 + $radius, $radius * 2, $radius * 2, $color);
    imagefilledellipse($img, $x2 - $radius, $y1 + $radius, $radius * 2, $radius * 2, $color);
    imagefilledellipse($img, $x1 + $radius, $y2 - $radius, $radius * 2, $radius * 2, $color);
    imagefilledellipse($img, $x2 - $radius, $y2 - $radius, $radius * 2, $radius * 2, $color);
}

// 6.1 Mobile Narrow Screenshots (1080x1920)
$mobileScreens = [
    'screenshot-mobile-dashboard.png' => [
        'title' => 'Student & Parent Portal',
        'subtitle' => 'Live Attendance, Exam Routine & Fees',
        'badge' => 'Instant Access',
        'color' => [79, 70, 229], // Indigo
    ],
    'screenshot-mobile-attendance.png' => [
        'title' => 'Smart Attendance Tracking',
        'subtitle' => 'Daily Clock In/Out & Leave Management',
        'badge' => 'Offline Ready',
        'color' => [16, 185, 129], // Emerald
    ],
    'screenshot-mobile-fees.png' => [
        'title' => 'Online Fee Payment & Receipts',
        'subtitle' => 'Download Statements & Instant Receipts',
        'badge' => 'Secured',
        'color' => [14, 165, 233], // Sky
    ],
];

foreach ($mobileScreens as $filename => $meta) {
    $w = 1080;
    $h = 1920;
    $im = imagecreatetruecolor($w, $h);

    // Modern slate background #F8FAFC
    $bg = imagecolorallocate($im, 248, 250, 252);
    imagefilledrectangle($im, 0, 0, $w, $h, $bg);

    // Top Brand Header Banner (Gradient look)
    $bannerColor = imagecolorallocate($im, $meta['color'][0], $meta['color'][1], $meta['color'][2]);
    imagefilledrectangle($im, 0, 0, $w, 520, $bannerColor);

    // Draw circular soft glow
    $glowColor = imagecolorallocatealpha($im, 255, 255, 255, 110);
    imagefilledellipse($im, (int) ($w * 0.85), 180, 480, 480, $glowColor);

    // Place Logo inside White Card on header
    $logoCardBg = imagecolorallocate($im, 255, 255, 255);
    drawRoundedRect($im, 80, 100, 300, 320, 36, $logoCardBg);

    // Copy logo into card
    $logoW = 160;
    $logoH = 160;
    $scale = min($logoW / $srcW, $logoH / $srcH);
    $scaledW = (int) round($srcW * $scale);
    $scaledH = (int) round($srcH * $scale);
    $dstX = 80 + (int) round((220 - $scaledW) / 2);
    $dstY = 100 + (int) round((220 - $scaledH) / 2);
    imagecopyresampled($im, $sourceImg, $dstX, $dstY, 0, 0, $scaledW, $scaledH, $srcW, $srcH);

    // Header Titles (using built-in font rendering with clean text boxes)
    $white = imagecolorallocate($im, 255, 255, 255);
    $whiteMuted = imagecolorallocate($im, 224, 231, 255);
    imagestring($im, 5, 340, 140, "PORUA SCHOOL ERP", $white);
    imagestring($im, 5, 340, 185, strtoupper($meta['title']), $white);
    imagestring($im, 4, 340, 240, $meta['subtitle'], $whiteMuted);
    imagestring($im, 4, 340, 280, "[ " . $meta['badge'] . " ]", $white);

    // Mobile Phone Mockup Body Cards
    $cardWhite = imagecolorallocate($im, 255, 255, 255);
    $borderCol = imagecolorallocate($im, 226, 232, 240);
    $textColor = imagecolorallocate($im, 30, 41, 59);
    $subText = imagecolorallocate($im, 100, 116, 139);
    $pillGreen = imagecolorallocate($im, 209, 250, 229);
    $textGreen = imagecolorallocate($im, 5, 150, 105);

    // Mockup Card 1: Main Stats Card
    drawRoundedRect($im, 80, 580, $w - 80, 880, 30, $cardWhite);
    imagerectangle($im, 80, 580, $w - 80, 880, $borderCol);
    imagestring($im, 5, 120, 620, "Academic Session 2026 - Live Portal", $textColor);
    imagestring($im, 4, 120, 660, "Attendance Status: 98.5% Present", $subText);

    // Stat Pockets
    drawRoundedRect($im, 120, 720, 480, 840, 20, $pillGreen);
    imagestring($im, 5, 150, 750, "PRESENT: 195 Days", $textGreen);
    drawRoundedRect($im, 520, 720, $w - 120, 840, 20, imagecolorallocate($im, 254, 243, 199));
    imagestring($im, 5, 550, 750, "FEES: ALL CLEARED", imagecolorallocate($im, 217, 119, 6));

    // Mockup Card 2: Quick Features List
    drawRoundedRect($im, 80, 930, $w - 80, 1420, 30, $cardWhite);
    imagestring($im, 5, 120, 970, "Today's Class Schedule & Notices", $textColor);

    $items = [
        "09:00 AM - Mathematics (Room 302, Prof. Rafiq)",
        "10:00 AM - Physics Lecture & Lab Experiment",
        "11:30 AM - Bangla Literature & Grammar",
        "01:00 PM - Mid-Term Exam Marksheet Published",
        "02:00 PM - Annual Sports Day Notice"
    ];
    $itemY = 1030;
    foreach ($items as $item) {
        drawRoundedRect($im, 120, $itemY, $w - 120, $itemY + 60, 16, imagecolorallocate($im, 241, 245, 249));
        imagestring($im, 4, 150, $itemY + 20, $item, $textColor);
        $itemY += 75;
    }

    // Mockup Card 3: Bottom Floating Dock (PWA Style)
    drawRoundedRect($im, 120, 1720, $w - 120, 1850, 40, imagecolorallocate($im, 15, 23, 42));
    imagestring($im, 5, 180, 1770, "Home      Attendance      Exams      Fees      Profile", $white);

    imagepng($im, "{$screenshotsDir}/{$filename}", 9);
    imagedestroy($im);
    echo "Generated Screenshot: {$filename}\n";
}

// 6.2 Desktop Wide Screenshots (1920x1080)
$desktopScreens = [
    'screenshot-desktop-dashboard.png' => [
        'title' => 'Executive Administrative Dashboard',
        'subtitle' => 'Real-time Analytics, Multi-Branch Management & Cashflow',
    ],
    'screenshot-desktop-academics.png' => [
        'title' => 'Academic, Exam & Marksheet Management',
        'subtitle' => 'Grade Calculations, Tabulation Sheets & Automated Reports',
    ],
];

foreach ($desktopScreens as $filename => $meta) {
    $w = 1920;
    $h = 1080;
    $im = imagecreatetruecolor($w, $h);

    $bg = imagecolorallocate($im, 248, 250, 252);
    imagefilledrectangle($im, 0, 0, $w, $h, $bg);

    // Desktop Left Sidebar (Dark Slate #0F172A)
    $sidebar = imagecolorallocate($im, 15, 23, 42);
    imagefilledrectangle($im, 0, 0, 360, $h, $sidebar);

    // Sidebar Logo Box
    $logoCardBg = imagecolorallocate($im, 255, 255, 255);
    drawRoundedRect($im, 40, 40, 120, 120, 20, $logoCardBg);

    // Copy logo
    $scale = min(60 / $srcW, 60 / $srcH);
    $scaledW = (int) round($srcW * $scale);
    $scaledH = (int) round($srcH * $scale);
    $dstX = 40 + (int) round((80 - $scaledW) / 2);
    $dstY = 40 + (int) round((80 - $scaledH) / 2);
    imagecopyresampled($im, $sourceImg, $dstX, $dstY, 0, 0, $scaledW, $scaledH, $srcW, $srcH);

    $white = imagecolorallocate($im, 255, 255, 255);
    $sidebarMuted = imagecolorallocate($im, 148, 163, 184);
    imagestring($im, 5, 140, 60, "PORUA.APP", $white);
    imagestring($im, 3, 140, 90, "Smart School ERP", $sidebarMuted);

    // Sidebar Menu Items
    $menuItems = [
        "Executive Dashboard",
        "Student Information",
        "Teachers & Staff",
        "Attendance Management",
        "Examinations & Marks",
        "Fee Collection & Accounts",
        "Library Management",
        "SMS & Push Notifications",
        "System Settings"
    ];
    $menuY = 170;
    foreach ($menuItems as $idx => $m) {
        if ($idx === 0) {
            drawRoundedRect($im, 25, $menuY - 8, 335, $menuY + 38, 12, imagecolorallocate($im, 79, 70, 229));
            imagestring($im, 4, 50, $menuY + 5, "> " . $m, $white);
        } else {
            imagestring($im, 4, 50, $menuY + 5, "   " . $m, $sidebarMuted);
        }
        $menuY += 50;
    }

    // Top Header Bar
    $headerWhite = imagecolorallocate($im, 255, 255, 255);
    imagefilledrectangle($im, 360, 0, $w, 100, $headerWhite);
    imagefilledrectangle($im, 360, 99, $w, 100, imagecolorallocate($im, 226, 232, 240));

    $textColor = imagecolorallocate($im, 15, 23, 42);
    imagestring($im, 5, 400, 30, $meta['title'], $textColor);
    imagestring($im, 3, 400, 60, $meta['subtitle'], imagecolorallocate($im, 100, 116, 139));

    // Desktop Metric Cards
    $cards = [
        ['Total Students', '439', 'Active Enrolled', [79, 70, 229]],
        ['Total Teachers', '41', 'Teaching Staff', [16, 185, 129]],
        ['Today Attendance', '96.8%', '380 Present Today', [245, 158, 11]],
        ['Net Collection', 'BDT 4,82,500', 'Current Month Fees', [14, 165, 233]]
    ];
    $cardX = 400;
    foreach ($cards as $c) {
        drawRoundedRect($im, $cardX, 130, $cardX + 340, 260, 16, $headerWhite);
        imagerectangle($im, $cardX, 130, $cardX + 340, 260, imagecolorallocate($im, 226, 232, 240));

        imagestring($im, 4, $cardX + 25, 155, $c[0], imagecolorallocate($im, 100, 116, 139));
        imagestring($im, 5, $cardX + 25, 185, $c[1], $textColor);
        imagestring($im, 3, $cardX + 25, 220, $c[2], imagecolorallocate($im, $c[3][0], $c[3][1], $c[3][2]));

        $cardX += 370;
    }

    // Large Chart & Table Mockup
    drawRoundedRect($im, 400, 290, $w - 40, $h - 40, 16, $headerWhite);
    imagerectangle($im, 400, 290, $w - 40, $h - 40, imagecolorallocate($im, 226, 232, 240));
    imagestring($im, 5, 430, 320, "Live Performance & Attendance Flow Analytics", $textColor);

    // Draw mock graph lines
    $graphCol = imagecolorallocate($im, 79, 70, 229);
    imagesetthickness($im, 4);
    $pts = [350, 420, 380, 500, 460, 590, 520, 680, 610, 750, 690, 820];
    for ($i = 0; $i < count($pts) - 2; $i += 2) {
        imageline($im, 440 + ($i * 70), $pts[$i + 1] + 200, 440 + (($i + 2) * 70), $pts[$i + 3] + 200, $graphCol);
    }
    imagesetthickness($im, 1);

    imagepng($im, "{$screenshotsDir}/{$filename}", 9);
    imagedestroy($im);
    echo "Generated Screenshot: {$filename}\n";
}

imagedestroy($sourceImg);
echo "\nAll PWA icons and branded screenshots successfully generated!\n";

