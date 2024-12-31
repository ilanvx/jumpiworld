<?php
session_start();

// בדוק אם הצבע נשמר ב-Session, אם לא, חזור לבחירת צבע
if (!isset($_SESSION['color'])) {
    header("Location: color_selection.php?error=יש לבחור צבע");
    exit;
}
?>

<!DOCTYPE html>
<html lang="he">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>פרטי משתמש - ג'אמפי</title>
<link rel="icon" href="icon.png" type="image/png">
    <link rel="stylesheet" href="register_styles.css">
    <script src="playMusic.js"></script>
<audio id="clickSound" src="music/click-sound.mp3" preload="auto"></audio>

<script>
    // בודק את כל הלחיצות בעמוד
    document.addEventListener('click', function() {
        const clickSound = document.getElementById('clickSound');
        clickSound.play();
        clickSound.volume = 0.3;
    });
</script>
    <script src="https://www.google.com/recaptcha/enterprise.js" async defer></script> <!-- סקריפט reCAPTCHA Enterprise -->
    <script>
        function onSubmit(token) {
            document.getElementById("register-form").submit();
        }
    </script>
</head>
<body>
    <div class="register-background">
        <div class="register-container centered">
            <h1>פרטי משתמש</h1>

            <!-- הצגת הודעת שגיאה -->
            <?php if (isset($_GET['error'])): ?>
                <div class="error-msg">
                    <?php echo htmlspecialchars($_GET['error']); ?>
                </div>
            <?php endif; ?>

<form id="register-form" action="register_process.php" method="POST">
    <div class="input-group">
        <label for="username">שם משתמש</label>
        <input type="text" id="username" name="username" required maxlength="15" minlength="4">
    </div>
    <div class="input-group">
        <label for="email">אימייל</label>
        <input type="email" id="email" name="email" required>
    </div>
    <div class="input-group">
        <label for="password">סיסמא</label>
        <input type="password" id="password" name="password" required>
    </div>
    <div class="input-group">
        <label for="confirm_password">אישור סיסמא</label>
        <input type="password" id="confirm_password" name="confirm_password" required>
    </div>

    <!-- תיבת סימון לאישור קריאת תקנון -->
    <div class="input-group">
        <input type="checkbox" id="terms" name="terms" required>
        <label for="terms">אני מאשר/ת שקראתי את <a href="../terms" target="_blank">התקנון</a></label>
    </div>
                <!-- כפתור reCAPTCHA עם עיצוב מותאם -->
                <div class="btn-container">
                    <button class="g-recaptcha btn" 
                            data-sitekey="6LdD5D4qAAAAAAK-u-OCdsOIpkw35N-fsq5xaNey" 
                            data-callback="onSubmit" 
                            data-action="register">
                        הירשם
                    </button>
                </div>
            </form>
        </div>
    </div>
</body>
</html>
