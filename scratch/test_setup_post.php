<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$payload = [
    'institute_type' => 'coaching',
    'school_name' => 'Apex Coaching Center',
    'school_code' => 'APEX-01',
    'school_phone' => '01812345678',
    'school_email' => 'contact@apex.com',
    'school_address' => 'Mirpur, Dhaka',
    'school_website' => '',
    'established_year' => '2020',
    'currency_symbol' => '৳',
    'invoice_footer_text' => 'Thank you',
    'session_name' => '2026-2027',
    'session_start' => '2026-01-01',
    'session_end' => '2026-12-31',
    'account_name' => 'Main Cash Counter',
    'account_type' => 'cash',
    'opening_balance' => '5000',
    'admin_name' => 'Apex Admin',
    'admin_email' => 'apexadmin@apex.com',
    'admin_password' => 'password123',
];

$request = Illuminate\Http\Request::create('/setup', 'POST', $payload);
$request->headers->set('X-Inertia', 'true');
$request->headers->set('Accept', 'text/html, application/xhtml+xml');

$response = $kernel->handle($request);
echo "Status: " . $response->getStatusCode() . PHP_EOL;
echo "Location: " . $response->headers->get('Location') . PHP_EOL;

$session = $request->session();
if ($session) {
    echo "Session errors: " . json_encode($session->get('errors') ? $session->get('errors')->all() : []) . PHP_EOL;
}
