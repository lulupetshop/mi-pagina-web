<?php
declare(strict_types=1);

require_once __DIR__ . '/../lib/PHPMailer/Exception.php';
require_once __DIR__ . '/../lib/PHPMailer/PHPMailer.php';
require_once __DIR__ . '/../lib/PHPMailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as PHPMailerException;

/**
 * Manda un mail por SMTP real (no el mail() de PHP, que en hosting
 * compartido suele fallar de forma intermitente/silenciosa). Si faltan
 * credenciales SMTP en config.php, no intenta nada y devuelve false.
 * Cualquier error queda en el log de errores de PHP (visible en hPanel)
 * en vez de perderse en silencio.
 */
function lulu_enviar_mail(string $destinatario, string $asunto, string $textoPlano, string $html): bool
{
    $config = lulu_config();

    $smtpHost = trim((string) ($config['smtp_host'] ?? ''));
    $smtpUser = trim((string) ($config['smtp_user'] ?? ''));
    $smtpPass = (string) ($config['smtp_pass'] ?? '');
    $smtpPort = (int) ($config['smtp_port'] ?? 465);
    $smtpSecure = trim((string) ($config['smtp_secure'] ?? 'ssl'));

    if ($smtpHost === '' || $smtpUser === '' || $smtpPass === '') {
        error_log('lulu_enviar_mail: faltan credenciales SMTP en config.php (smtp_host/smtp_user/smtp_pass).');
        return false;
    }

    $from = (string) ($config['mail_from'] ?? $smtpUser);
    $fromName = (string) ($config['mail_from_name'] ?? 'Lulú Lulú');

    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host = $smtpHost;
        $mail->SMTPAuth = true;
        $mail->Username = $smtpUser;
        $mail->Password = $smtpPass;
        $mail->SMTPSecure = $smtpSecure === 'tls' ? PHPMailer::ENCRYPTION_STARTTLS : PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port = $smtpPort;
        $mail->CharSet = 'UTF-8';

        $mail->setFrom($from, $fromName);
        $mail->addAddress($destinatario);

        $mail->isHTML(true);
        $mail->Subject = $asunto;
        $mail->Body = $html;
        $mail->AltBody = $textoPlano;

        $mail->send();
        return true;
    } catch (PHPMailerException $e) {
        error_log('lulu_enviar_mail: error al enviar - ' . $mail->ErrorInfo);
        return false;
    }
}
