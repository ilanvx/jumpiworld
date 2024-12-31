<?php
session_start();
?>

<!DOCTYPE html>
<html lang="he">
<head>
    <meta charset="viewport" content="width=device-width, initial-scale=1.0">
    <title>התחברות - ג'אמפי</title>
<link rel="icon" href="icon.png" type="image/png">
    <link rel="stylesheet" href="styles.css">
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
            document.getElementById("login-form").submit();
        }
    </script>
</head>
<body>
    <div class="login-container centered">
<script src="//code.tidio.co/zlgxm9ywnfvqbsyaxe7lysqlnnapckri.js" async></script>
        <h1>התחברות לג'אמפי</h1>
        
        <!-- הצגת הודעות שגיאה -->
        <?php if (isset($_GET['error'])): ?>
            <div class="error-msg">
                <?php echo htmlspecialchars($_GET['error']); ?>
            </div>
        <?php endif; ?>

        <div class="logo-container">
            <img src="logo.png" alt="לוגו של ג'אמפי">
        </div>

        <form id="login-form" action="login_process.php" method="POST">
            <div class="input-group">
                <label for="username">שם משתמש</label>
                <input type="text" id="username" name="username" required maxlength="15">
            </div>
            <div class="input-group">
                <label for="password">סיסמא</label>
                <input type="password" id="password" name="password" required>
            </div>

            <!-- כפתור התחברות עם reCAPTCHA Enterprise -->
<div class="btn-container">
    <button class="g-recaptcha btn" 
            data-sitekey="6LdD5D4qAAAAAAK-u-OCdsOIpkw35N-fsq5xaNey" 
            data-callback="onSubmit" 
            data-action="login">
        התחבר
    </button>
</div>

        </form>

        <!-- כפתור מעבר להרשמה ושכחתי סיסמה -->
        <div class="additional-links">
            <a href="color_selection.php" class="link">הרשמה</a>
            <a href="forgot_password.php" class="link">שכחתי סיסמה</a>
        </div>
    </div>
</body>
</html>
