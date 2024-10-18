<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

$test = false;
$result = new response();

if ($test) {
    $xdata = file_get_contents("TESTDATA.json");
} else {
    if ($_FILES['walk']['error'] == UPLOAD_ERR_OK               //checks for errors
            && is_uploaded_file($_FILES['walk']['tmp_name'])) { //checks that file is uploaded
        $xdata = file_get_contents($_FILES['walk']['tmp_name']);
        file_put_contents("TESTDATA.json", $xdata);
        checkDecode();
    }
}
$data = json_decode($xdata);
$walk = $data->walk;

$attachment = json_encode($walk, JSON_PRETTY_PRINT);
$walkbody = $data->walkbody;
$email = $data->email;
$fromSite = $data->fromSite;
$reason = "<p class='smaller'>This email was sent from the web page: " . $fromSite . "<br/>You are receiving this email as you are defined as a Programme Sec/Walks coordinator on that web site</p><hr/>";
$coords = $data->coords;
$message = "<p>Message: " . $email->message . "</p>";
$subject = $data->subject;
$fromname = $email->name;
$fromemail = $email->email;
$sig = "<p></p><p>Walk submitted by: " . $fromname . "</p><p>Email: " . $fromemail . "</p>";
$comment = "<p>Walk details are below, attached is a file containing the walk</p><hr/>";
$fullbody = $reason . $sig . $message . $comment . $walkbody;
sendEmail($subject, $coords, $email, $fullbody, $attachment, $result);

header("Access-Control-Allow-Origin: *");
header("Content-type: application/json");
echo json_encode($result);

function checkDecode() {
    if (json_last_error() !== JSON_ERROR_NONE) {
        $error = json_last_error_msg();
        $result = new response();
        $result->message = 'MESSAGE HAS NOT BEEN SENT: Json decoding error [' + $error + ']';
        $result->error = true;
        header("Access-Control-Allow-Origin: *");
        header("Content-type: application/json");
        echo json_encode($result);
        die();
    }
}

function sendEmail($subject, $coords, $fromemail, $body, $attachment, $res) {
    require_once('Exception.php');
    require_once('PHPMailer.php');
    require_once('SMTP.php');
    require_once('../../../configuration.php');
    $config = new JConfig();
    $mail = new PHPMailer(true);
    $res->sent = false;
    switch ($config->mailer) {
        case 'smtp':
            $mail->isSMTP();
            $mail->Host = $config->smtphost;
            $mail->SMTPAuth = $config->smtpauth;
            $mail->Username = $config->smtpuser;
            $mail->Password = $config->smtppass;
            $mail->SMTPSecure = $config->smtpsecure;
            $mail->Port = $config->smtpport;
            break;
        default:
            break;
    }
    $mail->setFrom($config->mailfrom, $config->fromname);
    $mail->addReplyTo($fromemail->email, $fromemail->name);
    foreach ($coords as $key => $value) {
        $mail->addAddress($key, $value);
    }
    $timestamp = date("YmdHis");
    $mail->AddStringAttachment($attachment, 'submitwalk' . $timestamp . '.walks');

    $mail->Subject = $subject;
    $style = file_get_contents('css/styleemail.css');
    $mail->msgHTML($body . "<style>" . $style . "</style>");

    if ($mail->send()) {
        $res->message = 'MESSAGE HAS BEEN SENT';
        $res->error = false;
        $res->sent = true;
    } else {
        $res->message = 'Message could not be sent :' + $mail->ErrorInfo;
        $res->error = true;
    }

    return $res;
}

class response {

    public $error = true;
    public $message = "Code not set";
}
