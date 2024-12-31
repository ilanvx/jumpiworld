<?php
session_start();
header("refresh:5;url=login.php");  // העברה לדף ההתחברות לאחר 5 שניות
?>

<!DOCTYPE html>
<html lang="he">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="playMusic.js"></script>
    <title>נרשמת בהצלחה - ג'אמפי</title>
    <style>
        /* סגנון כללי לרקע ולגוף */
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            color: #fff;
            text-align: center;
        }

        /* סגנון למיכל הודעת ההצלחה */
        .success-container {
            background-color: rgba(255, 255, 255, 0.2);
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }

        h1 {
            font-size: 3rem;
            margin-bottom: 20px;
            animation: fadeInDown 1s ease-in-out;
        }

        p {
            font-size: 1.5rem;
            margin-bottom: 20px;
            animation: fadeInUp 1.5s ease-in-out;
        }

        .redirect-msg {
            font-size: 1.2rem;
            margin-top: 20px;
        }

        #countdown {
            font-weight: bold;
            color: #ffeb3b;
        }

        @keyframes fadeInDown {
            from {
                opacity: 0;
                transform: translateY(-30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

    </style>
</head>
<body>
    <div class="register-background">
        <div class="success-container centered">
            <h1>נרשמת בהצלחה!</h1>
            <p>אנחנו מאחלים לך חוויה מדהימה ושמחים שהצטרפת אלינו!</p>
            <p>קיבלת מאיתנו במתנה 50 מטבעות</p>
            <div class="redirect-msg">
                <p>העברה לדף ההתחברות תתבצע בעוד <span id="countdown">5</span> שניות...</p>
            </div>
        </div>
    </div>

    <script>
        // טיימר לספירה לאחור
        let countdownElement = document.getElementById('countdown');
        let countdown = 5;

        setInterval(function() {
            countdown--;
            countdownElement.textContent = countdown;
            if (countdown <= 0) {
                clearInterval();
            }
        }, 1000);
    </script>
</body>
</html>
