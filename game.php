<?php
session_start();
require 'config.php';

// הצגת שגיאות לצורך דיבוג
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// בדיקה אם המשתמש מחובר
if (!isset($_SESSION['username'])) {
    header("Location: login.php");
    exit;
}

// טעינת header.php
include '../game/header.php'; // ודא שהנתיב נכון לקובץ header.php

// שליפת ערך ה-admin, mod והפריטים הנלבשים מהמסד נתונים
$query = "SELECT admin, msh, hd, ht, hr, st, ps, nk, gs, sk, sz, token FROM users WHERE username = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();
$userData = $result->fetch_assoc();
$stmt->close();

// יצירת טוקן אם עדיין אין למשתמש טוקן
if (empty($userData['token'])) {
    $token = bin2hex(random_bytes(16)); // יצירת טוקן ייחודי
    $updateTokenQuery = "UPDATE users SET token = ? WHERE username = ?";
    $stmt = $conn->prepare($updateTokenQuery);
    $stmt->bind_param("ss", $token, $username);
    $stmt->execute();
    $stmt->close();
} else {
    $token = $userData['token']; // קבלת הטוקן הקיים
}

// שמירת הטוקן ב-SESSION
$_SESSION['token'] = $token;

// קבלת ערך admin ו-mod כערכים לוגיים ב-JavaScript
$isAdminValue = ($userData['admin'] == 1) ? 'true' : 'false';
$isMshValue = ($userData['msh'] == 1) ? 'true' : 'false';

// שליפת פריטים הנלבשים מתוך עמודות המשתמש בטבלה 'users'
$equippedItems = [
    'hd' => $userData['hd'],
    'ht' => $userData['ht'],
    'hr' => $userData['hr'],
    'st' => $userData['st'],
    'ps' => $userData['ps'],
    'nk' => $userData['nk'],
    'gs' => $userData['gs'],
    'sk' => $userData['sk'],
    'sz' => $userData['sz']
];

// שליפת כל הפריטים מהטבלה items בהתאם לשם המשתמש
$query = "SELECT itemtype, itemid FROM items WHERE username = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

$items = [];
while ($row = $result->fetch_assoc()) {
    $items[] = $row;
}
$stmt->close();

// העברת נתוני הפריטים, הטוקן ונתוני המשתמש ל-JavaScript
echo "<script>
    const userItems = " . json_encode($items) . ";
    const equippedItems = " . json_encode($equippedItems) . ";
    const userToken = '$token'; // העברת הטוקן ל-JavaScript
</script>";
?>

<!DOCTYPE html>
<html lang="he">
<head>
    <meta charset="UTF-8">
    <audio id="backgroundMusic" src="../game/music/music.mp3" loop></audio>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>המשחק</title>

    <!-- חיבור לקובץ ה-CSS של המשחק -->
    <link rel="stylesheet" href="game_style.css">
    <link rel="stylesheet" href="admin_panel.css">

    <!-- טעינת ספריות Firebase -->
<script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-database.js"></script>
    <!-- העברת שם המשתמש ל-JavaScript -->
    <!-- העברת שם המשתמש ונתוני הפריטים ל-JavaScript -->
    <script>
        const username = "<?php echo $username; ?>";
        const isAdmin = <?php echo $isAdminValue; ?>;
        const isMsh = <?php echo $isMshValue; ?>;
        window.userItems = <?php echo json_encode($items); ?>;
        console.log("User Items loaded:", window.userItems);

    </script>

    <!-- חיבור לקובצי ה-JavaScript -->
    <script src="../game/play/profanityFilter.js?v=1.1.5"></script>
    <script src="../game/play/game.js?v=1.1.6" defer></script>
    <script src="../game/play/inventory.js?v=1.1.1" defer></script> <!-- חיבור לסקריפט inventory.js -->
    <script src="../game/play/trade.js?v=1.1.1" defer></script> <!-- חיבור לסקריפט inventory.js -->
</head>
<body>
<div class="game-container">
    <canvas id="gameCanvas" width="1200" height="680"></canvas>
</div>

<!-- סרגל כלים עם כפתור סל החפצים -->
<div id="toolbarWrapper" style="position: absolute; bottom: 0; left: 0; width: 100%; display: flex; justify-content: center; align-items: center;">
    <div id="toolbar" style="padding: 10px; border-radius: 25px; background: linear-gradient(to bottom, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.3)); display: flex; gap: 10px;">

        <!-- כפתור הבית בצד השמאלי -->
        <button id="homeButton" style="background-color: #4CAF50; color: white; border: none; border-radius: 50%; padding: 10px; width: 40px; height: 40px; font-size: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer;">🏠</button>

        <button id="emojiButton" style="background-color: #ffeb3b; color: black; border: none; border-radius: 50%; padding: 10px; width: 40px; height: 40px; font-size: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer;">😎</button>

        <button id="mapButton" style="background-color: #007bff; color: white; border: none; border-radius: 50%; padding: 10px; width: 40px; height: 40px; font-size: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer;">🗺️</button>

        <input type="text" id="chatInput" placeholder="כתוב הודעה..." maxlength="50" dir="rtl" style="width: 300px; height: 40px; border-radius: 20px; padding-left: 15px; border: 1px solid #ccc; text-align: right;" />

        <button id="sendButton" style="background-color: #6a0dad; color: white; border: none; border-radius: 50%; padding: 10px; width: 40px; height: 40px; font-size: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer;">✉️</button>

        <button id="inventoryButton" style="background-color: #007bff; color: white; border: none; border-radius: 50%; padding: 10px; width: 40px; height: 40px; font-size: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer;">🎒</button>

        <button id="settingsButton" style="background-color: #ffeb3b; color: black; border: none; border-radius: 50%; padding: 10px; width: 40px; height: 40px; font-size: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer;">⚙️</button>
    </div>
</div>
<div id="typingBubble" class="typing-bubble" style="display: none;">
    <div class="typing-dots">
        <span></span>
        <span></span>
        <span></span>
    </div>
</div>


<!-- חלונית המפה -->
<div id="mapModal" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: rgba(255, 255, 255, 0.9); padding: 20px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); z-index: 1000; max-width: 400px;">
    <h2 style="font-family: 'Arial', sans-serif; font-size: 24px; margin-bottom: 20px; color: #333;">רשימת אזורים</h2>
    <ul style="list-style-type: none; padding: 0;">
        <li style="margin-bottom: 10px;">
            <button id="seaButton" class="loadingButton" style="width: 100%; padding: 10px; font-size: 18px; background-color: #2196f3; border: none; border-radius: 5px; color: white; cursor: pointer; transition: background-color 0.3s;">חוף ים</button>
        </li>
        <li style="margin-bottom: 10px;">
            <button id="parkButton" class="loadingButton" style="width: 100%; padding: 10px; font-size: 18px; background-color: #4caf50; border: none; border-radius: 5px; color: white; cursor: pointer; transition: background-color 0.3s;">פארק</button>
        </li>
        <li style="margin-bottom: 10px;">
            <button id="spaceButton" class="loadingButton" style="width: 100%; padding: 10px; font-size: 18px; background-color: #1a237e; border: none; border-radius: 5px; color: white; cursor: pointer; transition: background-color 0.3s;">חלל</button>
        </li>
        <li style="margin-bottom: 10px;">
            <button id="footballButton" class="loadingButton" style="width: 100%; padding: 10px; font-size: 18px; background-color: #ff9800; border: none; border-radius: 5px; color: white; cursor: pointer; transition: background-color 0.3s;">מגרש כדורגל</button>
        </li>
    </ul>
    <button id="closeMapButton" style="margin-top: 20px; width: 100%; padding: 10px; font-size: 16px; background-color: #f44336; border: none; border-radius: 5px; color: white; cursor: pointer;">סגור</button>
</div>



<!-- חלונית ההגדרות -->
<div id="settingsModal" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: rgba(255, 255, 255, 0.9); padding: 20px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); z-index: 1000; max-width: 300px;">
    <h2 style="font-family: 'Arial', sans-serif; font-size: 20px; margin-bottom: 15px; color: #333;">הגדרות</h2>
    <button id="toggleMusicButton" style="width: 100%; padding: 10px; font-size: 16px; background-color: #4CAF50; border: none; border-radius: 5px; color: white; cursor: pointer; margin-bottom: 10px;">כבה/הפעל מוזיקה</button>
    <button id="toggleFullScreenButton" style="width: 100%; padding: 10px; font-size: 16px; background-color: #007bff; border: none; border-radius: 5px; color: white; cursor: pointer; margin-bottom: 10px;">מסך מלא</button>
    <button id="toggleChatHistoryButton" style="width: 100%; padding: 10px; font-size: 16px; background-color: #007bff; border: none; border-radius: 5px; color: white; cursor: pointer; margin-bottom: 10px;">היסטוריית צ'אט</button>
    
    <button id="closeSettingsButton" style="width: 100%; padding: 10px; font-size: 16px; background-color: #f44336; border: none; border-radius: 5px; color: white; cursor: pointer;">סגור</button>
</div>

<div id="emojiPanel" style="display: none; position: absolute; bottom: 60px; background-color: white; border: 1px solid #ccc; border-radius: 10px; padding: 10px;">
    <span class="emoji" style="font-size: 24px; cursor: pointer;">😊</span>
    <span class="emoji" style="font-size: 24px; cursor: pointer;">😂</span>
    <span class="emoji" style="font-size: 24px; cursor: pointer;">😍</span>
    <span class="emoji" style="font-size: 24px; cursor: pointer;">😢</span>
    <span class="emoji" style="font-size: 24px; cursor: pointer;">😎</span>
    <span class="emoji" style="font-size: 24px; cursor: pointer;">👍</span>
    <span class="emoji" style="font-size: 24px; cursor: pointer;">❤️</span>
    <span class="emoji" style="font-size: 24px; cursor: pointer;">🤔</span>
    <span class="emoji" style="font-size: 24px; cursor: pointer;">🤗</span>
    <span class="emoji" style="font-size: 24px; cursor: pointer;">🙌</span>
    <span class="emoji" style="font-size: 24px; cursor: pointer;">😡</span>
    <span class="emoji" style="font-size: 24px; cursor: pointer;">🎉</span>
    <span class="emoji" style="font-size: 24px; cursor: pointer;">😴</span>
    <span class="emoji" style="font-size: 24px; cursor: pointer;">🤩</span>
    <span class="emoji" style="font-size: 24px; cursor: pointer;">💬</span>
</div>


<script>
    const emojiButton = document.getElementById('emojiButton');
    const emojiPanel = document.getElementById('emojiPanel');
    const chatInput = document.getElementById('chatInput');

    // Toggle emoji panel
    emojiButton.addEventListener('click', () => {
        emojiPanel.style.display = (emojiPanel.style.display === 'none' || emojiPanel.style.display === '') ? 'block' : 'none';
    });

    // Add emoji to chat input
    document.querySelectorAll('.emoji').forEach(emoji => {
        emoji.addEventListener('click', (e) => {
            chatInput.value += e.target.textContent;
            emojiPanel.style.display = 'none'; // Close panel after selection
        });
    });

    // Close the emoji panel when clicking outside
    document.addEventListener('click', (e) => {
        if (!emojiButton.contains(e.target) && !emojiPanel.contains(e.target)) {
            emojiPanel.style.display = 'none';
        }
    });
</script>
</div>
    <script>
        // הוספת לוג לכפתור סל חפצים
        document.getElementById('inventoryButton').addEventListener('click', function() {
            console.log("Inventory button clicked");
        });
    </script>
    <!-- חלון הפופ-אפ של סל החפצים -->
<!-- כפתור לפרסום הודעה גלובלית, נראה רק אם המשתמש הוא מנהל -->

<!-- חלונית היסטוריית הצ'אט -->
<div id="chatHistoryWindow" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 400px; height: 500px; background-color: rgba(255, 255, 255, 0.9); border: 1px solid #ddd; border-radius: 10px; overflow-y: auto; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2); z-index: 1000;">
    <!-- כפתור לסגירת החלון -->
    <button id="closeChatHistoryButton" style="position: absolute; top: 10px; right: 10px; background: transparent; border: none; font-size: 20px; cursor: pointer;">&times;</button>
    
    <!-- כותרת החלון -->
    <h2 style="text-align: center; margin-top: 20px; font-size: 24px; color: #333;">היסטוריית צ'אט</h2>
    
    <!-- כאן תופיע ההיסטוריה -->
    <div id="chatHistoryContent" style="padding: 20px; color: #333; font-size: 16px; line-height: 1.5;">
        <!-- הודעות הצ'אט יוצגו כאן -->
    </div>
</div>



<!-- חלון הפופ-אפ של סל החפצים -->
<div id="inventoryModal" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: white; padding: 20px; border: 1px solid #ccc; z-index: 1000;">
    <div>
        <h2>סל החפצים שלך</h2>
        <div id="inventoryItemsContainer">
            <!-- כאן יופיעו הפריטים -->
        </div>
        <button id="closeInventoryButton">סגור</button>
    </div>
</div>

</div>

</div>
    </div>
</div>

        </div>
    </div>

</body>
</html>
