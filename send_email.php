<?php
header('Content-Type: application/json');

// ============================================================
//  CONFIGURACIÓN SMTP – Ajusta estos valores en tu hosting
// ============================================================
define('SMTP_HOST',   'localhost');              // Usamos localhost en vez del dominio
define('SMTP_USER',   'web@casaatmosfera.com');  // Cuenta creada en cPanel
define('SMTP_PASS',   'b[Un*PIYa01IbB}g');     // Contraseña de esa cuenta
define('SMTP_PORT',   587);                       // 587 suele funcionar mejor en localhost
define('SMTP_SECURE', '');                        // Dejamos vacío para conexión local directa
define('MAIL_TO',     'informacion@casaatmosfera.com');
// ============================================================

// Cargar PHPMailer (Opción A: Composer)
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require __DIR__ . '/vendor/autoload.php';
} else {
    // Opción B: Archivos descargados manualmente en /phpmailer/
    require __DIR__ . '/phpmailer/Exception.php';
    require __DIR__ . '/phpmailer/PHPMailer.php';
    require __DIR__ . '/phpmailer/SMTP.php';
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["status" => "error", "message" => "Método no permitido."]);
    exit;
}

// Leer datos del formulario
$json     = file_get_contents('php://input');
$data     = json_decode($json, true);

$nombre   = htmlspecialchars($data['nombre']   ?? '');
$whatsapp = htmlspecialchars($data['whatsapp'] ?? '');
$email    = htmlspecialchars($data['email']    ?? '');
$casa     = htmlspecialchars($data['casa']     ?? '');
$mensaje  = htmlspecialchars($data['mensaje']  ?? '');

// Plantilla HTML del correo
$htmlContent = "
<html>
<head>
<style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #E5DBD1; margin: 0; padding: 30px; }
    .container { background-color: #ffffff; max-width: 550px; margin: 0 auto; padding: 40px; border-radius: 4px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
    .header { text-align: center; border-bottom: 1px solid #E5DBD1; padding-bottom: 25px; margin-bottom: 30px; }
    .header h1 { color: #32332D; font-size: 22px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; margin: 0; }
    .content { color: #32332D; line-height: 1.6; }
    .field { margin-bottom: 20px; }
    .label { font-weight: 600; color: #858D8F; text-transform: uppercase; font-size: 11px; letter-spacing: 1.5px; margin-bottom: 6px; display: block; }
    .value { font-size: 15px; color: #32332D; background-color: #FAFAFA; padding: 12px 15px; border-radius: 4px; border-left: 3px solid #32332D; }
    .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #858D8F; letter-spacing: 1px; text-transform: uppercase; }
</style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>Nuevo Contacto</h1>
        </div>
        <div class='content'>
            <div class='field'>
                <span class='label'>Nombre</span>
                <div class='value'>{$nombre}</div>
            </div>
            <div class='field'>
                <span class='label'>WhatsApp</span>
                <div class='value'>{$whatsapp}</div>
            </div>
            <div class='field'>
                <span class='label'>Correo Electrónico</span>
                <div class='value'>{$email}</div>
            </div>
            <div class='field'>
                <span class='label'>Casa de Interés</span>
                <div class='value'>{$casa}</div>
            </div>
            <div class='field'>
                <span class='label'>Mensaje Adicional</span>
                <div class='value'>" . nl2br($mensaje) . "</div>
            </div>
        </div>
        <div class='footer'>
            Casa Atmósfera | Pilates &amp; Movimiento
        </div>
    </div>
</body>
</html>
";

// Enviar con PHPMailer
$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host       = SMTP_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = SMTP_USER;
    $mail->Password   = SMTP_PASS;
    $mail->SMTPSecure = SMTP_SECURE;
    $mail->Port       = SMTP_PORT;
    $mail->CharSet    = 'UTF-8';

    $mail->setFrom(SMTP_USER, 'Casa Atmósfera Web');
    $mail->addAddress(MAIL_TO, 'Casa Atmósfera');

    if (!empty($email)) {
        $mail->addReplyTo($email, $nombre);
    }

    $mail->isHTML(true);
    $mail->Subject = "Nuevo prospecto: Casa Atmósfera – {$nombre}";
    $mail->Body    = $htmlContent;
    $mail->AltBody = "Nombre: {$nombre}\nWhatsApp: {$whatsapp}\nEmail: {$email}\nCasa: {$casa}\nMensaje: {$mensaje}";

    $mail->send();
    echo json_encode(["status" => "success", "message" => "Mensaje enviado exitosamente."]);

} catch (Exception $e) {
    echo json_encode([
        "status"  => "error",
        "message" => "Error al enviar el mensaje. Por favor intenta de nuevo.",
        "debug"   => $mail->ErrorInfo // Puedes quitar esta línea en producción
    ]);
}
?>
