<?php
// Mostrar errores de PHP
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "<h1>Prueba de envío de correo SMTP</h1>";
echo "<p>Iniciando prueba...</p>";

// ============================================================
//  CONFIGURACIÓN SMTP – Misma que send_email.php
// ============================================================
define('SMTP_HOST',   'localhost'); 
define('SMTP_USER',   'web@casaatmosfera.com');  
define('SMTP_PASS',   'b[Un*PIYa01IbB}g');     
define('SMTP_PORT',   587);                       
define('SMTP_SECURE', '');                     
define('MAIL_TO',     'informacion@casaatmosfera.com');
// ============================================================

// Cargar PHPMailer
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require __DIR__ . '/vendor/autoload.php';
} else {
    require __DIR__ . '/phpmailer/Exception.php';
    require __DIR__ . '/phpmailer/PHPMailer.php';
    require __DIR__ . '/phpmailer/SMTP.php';
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$mail = new PHPMailer(true);

try {
    // Mostrar todo el registro de la conexión SMTP
    $mail->SMTPDebug = 3; 
    $mail->Debugoutput = 'html'; 

    $mail->isSMTP();
    $mail->Host       = SMTP_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = SMTP_USER;
    $mail->Password   = SMTP_PASS;
    $mail->SMTPSecure = SMTP_SECURE;
    $mail->Port       = SMTP_PORT;
    $mail->CharSet    = 'UTF-8';

    $mail->setFrom(SMTP_USER, 'Prueba Técnica');
    $mail->addAddress(MAIL_TO, 'Casa Atmósfera');

    $mail->isHTML(true);
    $mail->Subject = 'Prueba de conexión SMTP';
    $mail->Body    = 'Si recibes esto, el servidor SMTP está enviando correos correctamente.';

    echo "<h3>Registro de conexión SMTP:</h3>";
    echo "<div style='background: #f4f4f4; padding: 15px; border: 1px solid #ddd; margin-bottom: 20px; font-family: monospace;'>";
    $mail->send();
    echo "</div>";

    echo "<h2 style='color: green;'>✅ ¡El mensaje de prueba se envió correctamente!</h2>";
    echo "<p>Si recibes este mensaje, todo está bien. El problema podría estar en otro lado.</p>";

} catch (Exception $e) {
    echo "</div>";
    echo "<h2 style='color: red;'>❌ Hubo un error al conectar y enviar el correo.</h2>";
    echo "<p><strong>Revisa el cuadro gris de arriba para ver el error exacto del servidor.</strong></p>";
    echo "<p><strong>Error resumido:</strong> {$mail->ErrorInfo}</p>";
}
?>
