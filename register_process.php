<?php
session_start();
require 'config.php';

// רשימת מילים אסורות
$forbiddenWords = [
    'זונה', 
    'שרמוטה', 
    'בןזונה', 
    'קוקסינל', 
    'הומו', 
    'גיי', 
    'תחת', 
    'טוסיק', 
    'לסבית', 
    'פורנו', 
    'חמאס', 
    'פלסטין', 
    'מיהקאליפה', 
    'אנס', 
    'אונס', 
    'פדופיל', 
    'שנאה', 
    'בולבול',
    'כלבה',
    'חרא',
    'מניאק',
    'מפגר',
    'מטומטם',
    'זבל',
    'חלאה',
    'דפוק',
    'זין',
    'קקי',
    'פיפי',
    'נאצי',
    'נאצית',
    'פושע',
    'פיגור',
    'סטייה',
    'סוטה',
    'מזדיין',
    'סקס',
    'משגל',
    'גזען',
    'גזעני',
    'שטן',
    'בהמה',
    'נקרופיל',
    'סדיסט',
    'פיסטינג',
    'אנאלי',
    'אוראלי',
    'ליקוק',
    'חלאתאדם',
    'אידיוט',
    'טיפש',
    'עלוב',
    'דביל',
    'זבל',
    'מוכה',
    'חולי',
    'פאק',
    'מין',
    'ישבן',
    'fuck',
    'bitch',
    'whore',
    'slut',
    'bastard',
    'dick',
    'asshole',
    'cunt',
    'faggot',
    'queer',
    'retard',
    'pussy',
    'motherfucker',
    'fucker',
    'shit',
    'crap',
    'cock',
    'porn',
    'anal',
    'oral',
    'blowjob',
    'handjob',
    'nigger',
    'nigga',
    'spic',
    'wetback',
    'chink',
    'kike',
    'douchebag',
    'jerk',
    'loser',
    'stupid',
    'idiot',
    'moron',
    'retarded',
    'gay',
    'homo',
    'lesbian',
    'dyke',
    'fisting',
    'rape',
    'rapist',
    'incest',
    'necrophilia',
    'bestiality',
    'fetish',
    'slave',
    'twat',
    'bollocks',
    'bugger',
    'bloody',
    'tosser',
    'wanker',
    'bollocks',
    'shithead',
    'dumbass',
    'dipshit',
    'arse',
    'arsehole',
    'jerkoff',
    'fucker',
    'motherfucker',
    'cum',
    'cumshot',
    'semen',
    'sperm',
    'piss',
    'dildo',
    'vibrator',
    'blowjob',
    'handjob',
    'buttfuck',
    'buttplug',
    'hamas',
    'palestine',
    'scum',
    'wank',
    'whorehouse',
    'pimp',
    'hooker',
    'fag',
    'wop',
    'kike',
    'beaner',
    'gook',
    'cracker',
    'redneck',
    'white trash',
    'coon',
    'jigaboo',
    'peckerwood',
    'fucktard',
    'fuckwit',
    'tosser',
    'tramp',
    'bimbo',
    'skank',
    'sleaze',
    'horny',
    'kinky',
    'milf',
    'jizz',
    'balls',
    'tits',
    'boobs',
    'clit',
    'slit',
    'prick',
    'fudgepacker',
    'scat',
    'golden shower',
    'bukkake',
    'rimjob',
    'gangbang',
    'orgy',
    'slut',
    'cumslut',
    'slutty',
    'whoreish',
    'pimping',
    'tranny',
    'shemale',
    'futanari',
    'pornstar',
    'xxx',
    'masturbation',
    'masturbate',
    'jackoff',
    'jacking off',
    'jerk off',
    'ejaculate',
    'handjob',
    'headjob',
    'deepthroat',
    'doggystyle',
    'cowgirl',
    'missionary',
    'stripper',
    'lapdance',
    'escort',
    'call girl',
    'gigolo',
    'prostitute',
    'brothel',
    'sexslave',
    'slavegirl',
    'sexdoll',
    'pussylick',
    'cunnilingus',
    'penis',
    'vagina',
    'rectum',
    'anus',
    'oral sex',
    'group sex',
    'rape fantasy',
    'underage',
    'teen porn',
    'child porn',
    'incest',
    'pedophile',
    'pedo',
    'kiddie porn',
    'lolita',
    'sex trafficker',
    'molester',
    'grooming',
    'darkweb',
    'snuff film',
    'torture porn',
    'bdsm',
    'submissive',
    'dominatrix',
    'dominance',
    'sub',
    'dom',
    'master',
    'slave'
];

// פונקציה שבודקת אם שם המשתמש מכיל מילה אסורה
function containsForbiddenWord($username, $forbiddenWords) {
    foreach ($forbiddenWords as $word) {
        if (stripos($username, $word) !== false) { // חיפוש לא תלוי רישיות
            return true;
        }
    }
    return false;
}

if (isset($_POST['g-recaptcha-response'], $_POST['username'], $_POST['email'], $_POST['password'], $_POST['confirm_password'])) {
    $username = trim($_POST['username']);
    $email = trim($_POST['email']);
    $password = trim($_POST['password']);
    $confirm_password = trim($_POST['confirm_password']);
    $recaptchaResponse = $_POST['g-recaptcha-response'];

    // בדיקת CAPTCHA
    $recaptchaSecret = '6LdD5D4qAAAAAGNiEQ6sgtiswfmgs1pypB0PSVPc'; // Secret Key
    $apiKey = 'AIzaSyA4F3WlHJBEv2FJaDtxPSTb9_RnKz7gAFk'; // ה-API Key שלך
    $projectID = 'jumpi-1726090998040'; // Project ID

    $url = "https://recaptchaenterprise.googleapis.com/v1/projects/{$projectID}/assessments?key={$apiKey}";

    // הכנת בקשת ה-POST
    $data = [
        'event' => [
            'token' => $recaptchaResponse,
            'expectedAction' => 'register', // הפעולה הצפויה
            'siteKey' => '6LdD5D4qAAAAAAK-u-OCdsOIpkw35N-fsq5xaNey'
        ]
    ];

    // שליחת הבקשה ל-reCAPTCHA Enterprise
    $options = [
        'http' => [
            'header' => "Content-Type: application/json\r\n",
            'method' => 'POST',
            'content' => json_encode($data),
        ],
    ];

    $context = stream_context_create($options);
    $response = file_get_contents($url, false, $context);
    $responseKeys = json_decode($response, true);

    // בדיקת התגובה מ-reCAPTCHA
    if (!$responseKeys['tokenProperties']['valid']) {
        header("Location: register_step2.php?error=אימות CAPTCHA נכשל, אנא נסה שוב");
        exit();
    }

    // בדיקה אם הצבע נבחר
    if (!isset($_SESSION['color'])) {
        header("Location: color_selection.php?error=יש לבחור צבע");
        exit;
    }
    $color = $_SESSION['color'];

// בדיקת שדות
if (strlen($password) < 6) {
    header("Location: register_step2.php?error=הסיסמא חייבת להכיל לפחות 6 תווים");
    exit;
}

if (strlen($username) < 4) {
    header("Location: register_step2.php?error=שם משתמש חייב להכיל לפחות 4 תווים");
    exit;
}

// בדיקת שם משתמש: רק מספרים, אותיות באנגלית ועברית
if (!preg_match("/^[a-zA-Z0-9א-ת]+$/", $username)) {
    header("Location: register_step2.php?error=שם משתמש יכול להכיל רק אותיות בעברית, אנגלית ומספרים");
    exit();
}

// בדיקה אם המשתמש אישר את התקנון
if (!isset($_POST['terms'])) {
    header("Location: register_step2.php?error=חובה לאשר את התקנון כדי להמשיך בהרשמה");
    exit();
}


// בדיקת שמות משתמש אסורים
if (containsForbiddenWord($username, $forbiddenWords)) {
    header("Location: register_step2.php?error=שם המשתמש מכיל מילים אסורות");
    exit;
}

if ($password !== $confirm_password) {
    header("Location: register_step2.php?error=הסיסמאות אינן תואמות");
    exit;
}

if (strlen($username) > 15) {
    header("Location: register_step2.php?error=שם משתמש חייב להיות עד 15 תווים");
    exit;
}


    // בדיקת ייחודיות של שם המשתמש
    $stmt = $conn->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        header("Location: register_step2.php?error=שם המשתמש כבר קיים");
        exit();
    }

    // הוספת המשתמש למסד הנתונים עם ערך הצבע שנבחר
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $conn->prepare("INSERT INTO users (username, email, password, coins, hd) VALUES (?, ?, ?, 50, ?)");
    $stmt->bind_param("sssi", $username, $email, $hashed_password, $color);

    if ($stmt->execute()) {
        header("Location: register_success.php");
        exit();
    } else {
        $error = $stmt->error;
        header("Location: register_step2.php?error=שגיאה בהרשמה: " . urlencode($error));
        exit();
    }
} else {
    header("Location: register_step2.php?error=יש למלא את כל השדות");
    exit();
}
?>
