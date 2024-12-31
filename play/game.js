//created by Jumpi//
let isBackgroundSet = false;
let background = new Image();
let currentArea = 'sea'; 
let currentBackground = background;     
let isPlayerDataLoaded = false;
let db; 
let canvas, ctx;
let loadingImage = new Image();
loadingImage.src = '../game/play/assets/load.png';
let loadingComplete = false;

window.onload = function() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    showLoadingScreen();

    // Simulate loading time of a few seconds before initializing Firebase
    setTimeout(() => {
        fetch('../game/firebaseConfig.php')
            .then(response => response.json()) 
            .then(config => {
                if (!firebase.apps.length) {
                    const app = firebase.initializeApp(config);
                    db = firebase.database();
                } else {
                    db = firebase.database();  
                }

                loadingComplete = true;
                startGame(); 

            })
            .catch(error => {
                console.error('Error loading Firebase config:', error);
            });
    }, 3000); // Wait for 3 seconds before loading Firebase
};

function showLoadingScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(loadingImage, 0, 0, canvas.width, canvas.height);

    if (!loadingComplete) {
        requestAnimationFrame(showLoadingScreen);
    }
}

// Rest of your code...
const backgroundMusic = document.getElementById('backgroundMusic');

const toggleMusicButton = document.getElementById('toggleMusicButton');
// הפעלת המוזיקה כשהמשחק מתחיל
backgroundMusic.volume = 0.5; // עוצמת המוזיקה בין 0 ל-1
backgroundMusic.play().catch(error => {
    console.error("Error playing background music:", error);
});

// הפונקציה שמפעילה או מכבה את המוזיקה
toggleMusicButton.addEventListener('click', function() {
    if (backgroundMusic.paused) {
        backgroundMusic.play();
        toggleMusicButton.textContent = 'כבה מוזיקה'; // שינוי הטקסט של הכפתור
    } else {
        backgroundMusic.pause();
        toggleMusicButton.textContent = 'הפעל מוזיקה'; // שינוי הטקסט של הכפתור
    }
});

// Rest of your existing game code continues here...
// פתיחת חלון היסטוריית הצ'אט בלחיצה על כפתור פתיחה
document.getElementById('toggleChatHistoryButton').addEventListener('click', function() {
    document.getElementById('chatHistoryWindow').style.display = 'block';
});

// סגירת חלון היסטוריית הצ'אט בלחיצה על כפתור הסגירה (כפתור X)
document.getElementById('closeChatHistoryButton').addEventListener('click', function() {
    document.getElementById('chatHistoryWindow').style.display = 'none';
});

function startGame() {
    if (!db) {
        console.error('Firebase Database is not initialized!');
        return;
    }

    setBackgroundByTime();
    initializeAreas();
    setInitialArea();
    handleMultipleLogin();
    



function handleMultipleLogin() {
    const userRef = db.ref('players/' + username);
    const uniqueSessionId = Date.now(); // מזהה ייחודי לכל חיבור

    // עדכון Firebase עם מזהה ייחודי לחיבור הנוכחי
    userRef.update({ sessionId: uniqueSessionId })
        .then(() => {
            // מאזין לשינויים במזהה החיבור ב-Firebase
            userRef.on('value', (snapshot) => {
                const data = snapshot.val();
                
                if (data && data.sessionId && data.sessionId !== uniqueSessionId) {
                    // אם מזהה החיבור הנוכחי שונה מזה שב-Firebase, ננתק את החיבור הקודם
                    alert("התחברת ממכשיר אחר. המכשיר הנוכחי ינותק.");
                    window.location.href = '../game/dashboard.php'; // ניתוב לדשבורד
                }
            });
        })
        .catch((error) => {
            console.error("Error updating session ID:", error);
        });
}

// עדכון הדמות מבלי למחוק אותה בעת יציאה
window.addEventListener('beforeunload', function() {
    const userRef = db.ref('players/' + username);

    // לא מוחקים את הדמות, אלא פשוט מעדכנים את הסטטוס או מבצעים פעולות אחרות אם נדרש
    userRef.update({ isOnline: false }) // ניתן להוסיף שדה שמעדכן אם המשתמש מחובר
        .then(() => {
            console.log("User status updated to offline.");
        })
        .catch((error) => {
            console.error("Error updating user status:", error);
        });
});
function disconnectUser(usernameToDisconnect) {
    // קישור למשתמש במסד הנתונים
    const userStatusRef = firebase.database().ref('players/' + usernameToDisconnect + '/status');

    // עדכון הסטטוס ל-'disconnected'
    userStatusRef.set('disconnected')
        .then(() => {
            console.log(usernameToDisconnect + ' נותק בהצלחה.');
            alert(usernameToDisconnect + ' נותק בהצלחה.');
        })
        .catch((error) => {
            console.error('שגיאה בעת ניתוק המשתמש:', error);
        });
}
function checkUserStatus() {
    const userRef = db.ref('players/' + username); // שימוש במשתנה הדינמי של שם המשתמש

    // מאזינים לשינויים במשתמש
    userRef.on('value', (snapshot) => {
        if (!snapshot.exists()) {
            // אם המשתמש נמחק, נבצע ניתוב לדשבורד
            alert('נותקת מהמשחק');
            window.location.href = '../game/dashboard.php'; // ניתוב לדשבורד
        }
    });
}

// קריאה לפונקציה כאשר המשחק נטען
checkUserStatus();


// הפעלת הפונקציה עם שם המשתמש המחובר
checkAndAwardGift(username); // כעת זה יזהה את שם המשתמש האוטומטי
// פונקציה לבדיקת קבלת המתנה והענקת המתנה
function checkAndAwardGift(username) {
    const item = { itemid: 6, itemtype: 'st' }; // הגדרת הפריט
    fetch('../game/give_gift.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, itemid: item.itemid, itemtype: item.itemtype })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            showGiftAnimation(item); // הצגת האנימציה
        } else if (data.status === 'already_received') {
            console.log('המשתמש כבר קיבל את המתנה.');
        } else {
            console.error('Error:', data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}

// פונקציה להצגת אנימציה של המתנה
// פונקציה להצגת המתנה עם עיצוב מחודש
// פונקציה להצגת המתנה עם עיצוב מחודש
function showGiftAnimation(item) {
    const giftModal = document.createElement('div');
    giftModal.style.position = 'fixed';
    giftModal.style.top = '50%';
    giftModal.style.left = '50%';
    giftModal.style.transform = 'translate(-50%, -50%)';
    giftModal.style.width = '400px';  // הגדלת החלון מעט
    giftModal.style.height = '450px'; // הגדלת הגובה מעט
    giftModal.style.backgroundColor = '#fff';
    giftModal.style.borderRadius = '20px';
    giftModal.style.textAlign = 'center';
    giftModal.style.zIndex = '9999';
    giftModal.style.padding = '30px';
    giftModal.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.2)';
    giftModal.style.border = '2px solid #a1c4fd';
    giftModal.style.overflow = 'hidden'; 

    // תמונת הפריט
    const giftImage = new Image();
    giftImage.src = `../game/items/${item.itemtype}/${item.itemid}/front.png`; // נתיב הפריט
    giftImage.style.width = '200px';  // הגדלנו את הגודל של הפריט
    giftImage.style.height = '200px';
    giftImage.style.objectFit = 'contain';
    giftImage.style.margin = '0 auto';
    giftImage.style.maxWidth = '100%';
    giftImage.style.maxHeight = '100%';
    giftImage.style.marginTop = '20px';  // מיקום מרכזי יותר
    giftImage.style.borderRadius = '15px';
    giftImage.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.1)'; // צל עדין מתחת לתמונה

    // הודעת זכייה
    const giftText = document.createElement('h2');
    giftText.textContent = 'ברוך הבא למשחק, זכית במתנה';
    giftText.style.color = '#4a90e2'; // צבע כחול יפה
    giftText.style.fontFamily = 'Arial, sans-serif';
    giftText.style.marginTop = '20px';
    giftText.style.fontSize = '28px';  // הגדרת גודל טקסט גדול יותר
    giftText.style.letterSpacing = '1px'; // מרווח קטן בין האותיות
    giftText.style.textShadow = '1px 1px 4px rgba(0, 0, 0, 0.2)'; // צל טקסט עדין
    giftText.style.zIndex = '11';

    // כפתור לסגירת החלון עם רענון
    const closeButton = document.createElement('button');
    closeButton.textContent = 'סגור';
    closeButton.style.marginTop = '30px';
    closeButton.style.padding = '12px 25px';  // הגדלת הכפתור
    closeButton.style.backgroundColor = '#4a90e2';
    closeButton.style.color = '#fff';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '8px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontSize = '18px';  // גודל טקסט מעט גדול יותר
    closeButton.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.15)';
    closeButton.style.transition = 'background-color 0.3s ease';
    closeButton.style.position = 'relative';

    closeButton.onmouseover = function() {
        closeButton.style.backgroundColor = '#357ABD'; // שינוי צבע בלחיצה
    };
    
    closeButton.onmouseout = function() {
        closeButton.style.backgroundColor = '#4a90e2'; // צבע חזרה כשלא בלחיצה
    };

    // אירוע סגירה + רענון דף
    closeButton.addEventListener('click', () => {
        document.body.removeChild(giftModal);
        window.location.reload(); // רענון הדף
    });

    // הוספת כל האלמנטים ל-modal
    giftModal.appendChild(giftImage);
    giftModal.appendChild(giftText);
    giftModal.appendChild(closeButton);
    document.body.appendChild(giftModal);
}

// מציג את ההודעות בהיסטוריית הצ'אט
function appendToChatHistory(username, message) {
    const chatHistoryContent = document.getElementById('chatHistoryContent');
    const messageElement = document.createElement('div');
    
    // הוספת שם המשתמש וההודעה
    messageElement.innerHTML = `<strong>${username}:</strong> ${message}`;
    chatHistoryContent.appendChild(messageElement);

    // גלילה אוטומטית לתחתית חלון הצ'אט
    chatHistoryContent.scrollTop = chatHistoryContent.scrollHeight;
}

// מאזין להודעות שנשלחות ל-Firebase ומוסיף אותן לחלון היסטוריית הצ'אט
db.ref('messages').on('child_added', (snapshot) => {
    const data = snapshot.val();
    
    // ודא שההודעה מכילה את שם המשתמש ואת ההודעה עצמה
    if (data && data.message && data.username) {
        appendToChatHistory(data.username, data.message); // הוספת ההודעה להיסטוריה
    } else {
        console.error("ההודעה לא תקינה או חסרים בה נתונים:", snapshot.val());
    }
});

function initializeAreas() {
    const areas = {
        sea: { image: '../game/play/assets/rooms/sea.png', nightImage: '../game/play/assets/rooms/sea_night.png' },
        park: { image: '../game/play/assets/rooms/park.png', nightImage: '../game/play/assets/rooms/park_night.png' },
        space: { image: '../game/play/assets/rooms/space.png' },
        football: { image: '../game/play/assets/rooms/football.png', nightImage: '../game/play/assets/rooms/football_night.png' }
    };
    const areaImage = new Image();  // דואג שההגדרה של areaImage תהיה לפני הפונקציה

    function changeArea(newArea) {
        if (newArea === currentArea) return;
        currentArea = newArea;
        loadingComplete = false;
        showLoadingScreen();
        
        // Update area in Firebase
        db.ref(`players/${username}`).update({
            area: newArea
        });

        // Set fixed character position in all areas
        mc.x = 250;
        mc.y = 350;

        let newAreaImage = '';
        const currentTime = new Date();
        const hour = currentTime.getHours();

        if (hour >= 19 || hour < 6 && areas[newArea].nightImage) {
            newAreaImage = areas[newArea].nightImage;
        } else {
            newAreaImage = areas[newArea].image;
        }

        currentBackground.src = newAreaImage;
        currentBackground.onload = function() {
            console.log('Background loaded successfully');
            loadingComplete = true;
            drawAllPlayers();
            updateCanvas();
        };

        currentBackground.onerror = function() {
            console.error('Failed to load background image');
        };

        updatePlayerPosition(username, mc.x, mc.y, mc.angle, isMsh);
    }




        // מאזינים לכפתורים
        document.getElementById('seaButton').addEventListener('click', function() {
            changeArea('sea');
        });
document.getElementById('spaceButton').addEventListener('click', function() {
    changeArea('space');
});
document.getElementById('footballButton').addEventListener('click', function() {
    changeArea('football');  // שינוי האזור לכדורגל
});

        document.getElementById('parkButton').addEventListener('click', function() {
            changeArea('park');
        });
    }


document.addEventListener("contextmenu", function(e) {
  e.preventDefault();
}, false);

document.addEventListener("keydown", function(e) {
  if (e.key === "F12" || (e.ctrlKey && e.shiftKey && e.key === "I")) {
    e.preventDefault();
  }
}, false);
document.querySelectorAll('.loadingButton').forEach(button => {
    button.addEventListener('click', function() {
        this.classList.add('loading');
        this.disabled = true;

        // סימולציה של טעינה ל-2 שניות
        setTimeout(() => {
            this.classList.remove('loading');
            this.disabled = false;
        }, 2000); // זמן הטעינה
    });
});


    // התאמת גודל הקנבס למסכים קטנים תוך שמירה על יחס רזולוציה של 1200x680
    const canvas = document.getElementById('gameCanvas');
    const token = localStorage.getItem('userToken') || userToken; 
    const ctx = canvas.getContext('2d'); // הגדרת הקונטקסט עבור הקנבס
    canvas.width = 1200;
    canvas.height = 680;
    canvas.style.maxWidth = '100%';
    canvas.style.maxHeight = '100%';
    canvas.style.width = 'auto';
    canvas.style.height = 'auto';

db.ref('players/' + username).on('value', (snapshot) => {
    const playerData = snapshot.val();
    if (playerData) {
        mc.x = playerData.x || 250;
        mc.y = playerData.y || 350;
        mc.angle = playerData.angle || 0;
        equippedItems = playerData.equippedItems || {};
        const isMsh = playerData.msh === 1; // בדיקה אם msh הוא 1

        isPlayerDataLoaded = true;
        console.log('Player data loaded:', playerData);
    }

    // לאחר טעינת הנתונים הראשונית, נעדכן את מיקום השחקן
    if (isPlayerDataLoaded) {
        updatePlayerPosition(username, mc.x, mc.y, mc.angle, isMsh); // כולל את המשתנה isMsh בנתונים
        updateCanvas();
    }
});

    
db.ref('.info/connected').on('value', function(snapshot) {
    if (snapshot.val() === true) {
        console.log("Firebase connected, loading equipped items...");
        loadEquippedItems();  // קריאה לפונקציה רק כאשר Firebase מחובר
    } else {
        console.error("Not connected to Firebase yet. Retrying...");
        setTimeout(function() {
            db.ref('.info/connected').once('value', function(newSnapshot) {
                if (newSnapshot.val() === true) {
                    console.log("Successfully connected on retry.");
                    loadEquippedItems(); // קריאה לפונקציה לאחר התחברות מוצלחת
                } else {
                    console.error("Still not connected after retry.");
                }
            });
        }, 2000);  // ממתין 2 שניות לפני בדיקה מחדש
    }
});


     setInitialArea();
    let mc = {x: 250, y: 350, width: 55, height: 70, angle: 0}; // דמות ראשונית עם זווית
    let breathScale = 1; // קנה המידה עבור הנשימה (התחלה בגודל מלא)
    let breathDirection = -1; // כיוון הנשימה (כיווץ מלמעלה למטה)

    // בדיקת השעה הנוכחית לטעינת הרקע המתאים
    const currentTime = new Date();
function setBackgroundByTime() {
    if (!isBackgroundSet) {
        const currentTime = new Date();
        const hour = currentTime.getHours();
        
        let areaImage = '';
        switch(currentArea) {
            case 'sea':
                areaImage = hour >= 19 || hour < 6 ? '../game/play/assets/rooms/sea_night.png' : '../game/play/assets/rooms/sea.png';
                break;
            case 'park':
                areaImage = hour >= 19 || hour < 6 ? '../game/play/assets/rooms/park_night.png' : '../game/play/assets/rooms/park.png';
                break;
            case 'space':
                areaImage = '../game/play/assets/rooms/space.png'; // No night variation for space
                break;
            case 'football':
                areaImage = hour >= 19 || hour < 6 ? '../game/play/assets/rooms/football_night.png' : '../game/play/assets/rooms/football.png';
                break;
            default:
                areaImage = '../game/play/assets/rooms/sea.png';
        }

        currentBackground.src = areaImage;
        isBackgroundSet = true;
    }
}

// משתנים לכפתורים ולחלונית המפה
const mapButton = document.getElementById('mapButton');
const mapModal = document.getElementById('mapModal');
const closeMapButton = document.getElementById('closeMapButton');
    // הפעלת תיבת ההגדרות
    const settingsButton = document.getElementById('settingsButton');
    const settingsModal = document.getElementById('settingsModal');
    const toggleFullScreenButton = document.getElementById('toggleFullScreenButton');
    const closeSettingsButton = document.getElementById('closeSettingsButton');
    
    settingsButton.addEventListener('click', () => {
        settingsModal.style.display = 'block';
    });

    closeSettingsButton.addEventListener('click', () => {
        settingsModal.style.display = 'none';
    });

    // הפעלת/כיבוי מסך מלא
    toggleFullScreenButton.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            toggleFullScreenButton.textContent = 'חזרה למסך רגיל'; // שינוי הכפתור בעת מסך מלא
        } else {
            document.exitFullscreen();
            toggleFullScreenButton.textContent = 'מסך מלא'; // החזרה לטקסט המקורי
        }
    });

    // סגירת תיבת ההגדרות בלחיצה מחוץ לחלון
    window.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
    });
// פתיחת חלונית המפה בלחיצה על כפתור המפה
mapButton.addEventListener('click', () => {
    mapModal.style.display = 'block';
});

// סגירת חלונית המפה בלחיצה על כפתור הסגירה
closeMapButton.addEventListener('click', () => {
    mapModal.style.display = 'none';
});

// סגירת חלונית המפה בלחיצה מחוץ לחלון
window.addEventListener('click', (e) => {
    if (e.target === mapModal) {
        mapModal.style.display = 'none';
    }
});

// אובייקט לאחסון כל התמונות שנטענו מראש לפי סוג פריט וזווית
let itemImagesCache = {};
let etrog = new Image();
etrog.src = '../game/play/assets/etrog.png';

let etrogX = 0; // מיקום אופקי רנדומלי
let etrogY = 0; // מיקום אנכי רנדומלי
let isEtrogVisible = false; // משתנה שמסמן אם האתרוג מוצג
let etrogInterval; // טיימר להצגת האתרוג

// פונקציה להצגת אתרוג חדש במיקום רנדומלי
function spawnEtrog() {
    etrogX = Math.random() * (canvas.width - 50); // מיקום אופקי רנדומלי בקנבס
    etrogY = Math.random() * (canvas.height - 50); // מיקום אנכי רנדומלי בקנבס
    isEtrogVisible = true;
    updateCanvas(); // נעדכן את הקנבס כדי לצייר את האתרוג
}

// מאזין ללחיצה על הקנבס ובדיקה אם לוחצים על האתרוג
canvas.addEventListener('click', function(event) {
    const mousePos = getMousePosInCanvas(event);

    // בדיקה אם נלחץ על האתרוג
    if (isEtrogVisible && mousePos.x >= etrogX && mousePos.x <= etrogX + 50 && mousePos.y >= etrogY && mousePos.y <= etrogY + 50) {
        isEtrogVisible = false; // הסתרת האתרוג לאחר הלחיצה
        updateCanvas(); // עדכון הקנבס כדי להעלים את האתרוג
        collectEtrog(); // קריאה לפונקציה לעדכון ב-MySQL
        clearInterval(etrogInterval); // הפסקת הטיימר הקיים
        // הצגת אתרוג חדש לאחר כמה שניות
        etrogInterval = setTimeout(spawnEtrog, 10000 + Math.random() * 5000); // אתרוג חדש יופיע לאחר 10-15 שניות
    }
});

// פונקציה שמחשבת את מיקום העכבר ביחס לקנבס בהתחשב במיקום הקנבס בעמוד
function getMousePosInCanvas(event) {
    const rect = canvas.getBoundingClientRect(); // גבולות הקנבס על המסך
    const scaleX = canvas.width / rect.width; // יחס הרוחב בין הקנבס לעמוד
    const scaleY = canvas.height / rect.height; // יחס הגובה בין הקנבס לעמוד

    const mouseX = (event.clientX - rect.left) * scaleX;
    const mouseY = (event.clientY - rect.top) * scaleY;

    return { x: mouseX, y: mouseY };
}


// פונקציה לעדכון ב-MySQL על איסוף האתרוג
function collectEtrog() {
    fetch('../game/update_etrog.php', {
        method: 'POST', // שימוש ב-POST במקום GET
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) // אנחנו לא צריכים לשלוח נתונים
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            console.log('Etrog count updated successfully in MySQL!');
        } else {
            console.error('Error updating etrog count:', data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}


function drawEtrog(x, y) {
    const etrogWidth = 30;  // רוחב קטן יותר
    const etrogHeight = 40; // גובה קטן יותר
    ctx.drawImage(etrogImage, x, y, etrogWidth, etrogHeight); // ציור האתרוג בגודל מותאם
}


// פונקציה לתזוזת הדמות
function moveCharacter(event) {
    const mousePos = getMousePosInCanvas(event);
    calWalk(mousePos.x, mousePos.y); // קורא לפונקציה שאחראית על תזוזת הדמות
}
let isUserProfileOpen = false; // משתנה גלובלי לבדיקה אם חלון הפרופיל פתוח

function openUserProfile(targetPlayer) {
    if (isUserProfileOpen) return;

    isUserProfileOpen = true;

    const profileModal = document.createElement('div');
    profileModal.id = 'profileModal';
    profileModal.style.position = 'fixed';
    profileModal.style.top = '50%';
    profileModal.style.left = '50%';
    profileModal.style.transform = 'translate(-50%, -50%)';
    profileModal.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    profileModal.style.padding = '30px';
    profileModal.style.borderRadius = '15px';
    profileModal.style.zIndex = '9999';
    profileModal.style.color = '#333';
    profileModal.style.textAlign = 'center';
    profileModal.style.width = '300px';
    profileModal.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
    profileModal.style.animation = 'fadeIn 0.5s ease';

    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
    overlay.style.zIndex = '9998';
    overlay.style.animation = 'fadeIn 0.5s ease';
    document.body.appendChild(overlay);

    const userName = document.createElement('h3');
    userName.textContent = targetPlayer.username;
    userName.style.marginBottom = '20px';
    userName.style.fontSize = '22px';
    userName.style.color = '#555';
    profileModal.appendChild(userName);

    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.style.padding = '5px 10px';
    closeButton.style.fontSize = '18px';
    closeButton.style.backgroundColor = 'transparent';
    closeButton.style.border = 'none';
    closeButton.style.cursor = 'pointer';
    closeButton.style.color = '#555';
    closeButton.onclick = function() {
        document.body.removeChild(profileModal);
        document.body.removeChild(overlay);
        isUserProfileOpen = false;
    };
    profileModal.appendChild(closeButton);

// יצירת כפתור ההחלפה
const tradeButton = createActionButton('💼', 'שלח בקשת החלפה');

// פונקציה שתופעל כאשר לוחצים על הכפתור
tradeButton.onclick = function() {
    if (targetPlayer) {
        console.log(`Sending trade request to: ${targetPlayer.username}`);
        sendTradeRequest(targetPlayer); // קריאה לפונקציה בקובץ trade.js
    } else {
        console.error("Target player not defined.");
        alert("אין שחקן יעד לביצוע ההחלפה.");
    }
};


// הוספת הכפתור לתפריט הפרופיל
profileModal.appendChild(tradeButton);


    const homeButton = createActionButton('🏠', 'כניסה לבית');
    profileModal.appendChild(homeButton);

    const reportButton = createActionButton('🚨', 'דיווח');
    reportButton.onclick = function() {
        openReportModal(targetPlayer);
    };
    profileModal.appendChild(reportButton);

    document.body.appendChild(profileModal);

    function createActionButton(icon, text) {
        const button = document.createElement('button');
        button.innerHTML = `${icon} ${text}`;
        button.style.backgroundColor = '#4CAF50';
        button.style.border = 'none';
        button.style.color = 'white';
        button.style.padding = '10px 20px';
        button.style.marginTop = '15px';
        button.style.cursor = 'pointer';
        button.style.borderRadius = '50px';
        button.style.fontSize = '16px';
        button.style.transition = 'background-color 0.3s';
        button.style.display = 'block';
        button.style.width = '100%';

        button.onmouseover = () => {
            button.style.backgroundColor = '#45a049';
        };
        button.onmouseout = () => {
            button.style.backgroundColor = '#4CAF50';
        };

        return button;
    }
}
function openReportModal(targetPlayer) {
    const reportModal = document.createElement('div');
    reportModal.style.position = 'fixed';
    reportModal.style.top = '50%';
    reportModal.style.left = '50%';
    reportModal.style.transform = 'translate(-50%, -50%)';
    reportModal.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
    reportModal.style.padding = '30px';
    reportModal.style.borderRadius = '15px';
    reportModal.style.zIndex = '10000';
    reportModal.style.color = '#333';
    reportModal.style.textAlign = 'center';
    reportModal.style.width = '400px';
    reportModal.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';

    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
    overlay.style.zIndex = '9999';

    // סגירה על ידי לחיצה על הרקע
    overlay.onclick = function() {
        document.body.removeChild(reportModal);
        document.body.removeChild(overlay);
    };
    
    document.body.appendChild(overlay);

    const title = document.createElement('h3');
    title.textContent = `דיווח על ${targetPlayer.username}`;
    reportModal.appendChild(title);

    // יצירת תפריט נפתח לבחירת סיבת הדיווח
    const reasonSelect = document.createElement('select');
    reasonSelect.style.width = '90%';
    reasonSelect.style.padding = '10px';
    reasonSelect.style.marginTop = '10px';
    reasonSelect.style.borderRadius = '5px';

    // הוספת אפשרויות לתפריט הנפתח
    const reasons = ['ספאם', 'שפה לא נאותה', 'התנהגות פוגענית', 'הונאה', 'אחר'];
    reasons.forEach(reason => {
        const option = document.createElement('option');
        option.value = reason;
        option.textContent = reason;
        reasonSelect.appendChild(option);
    });

    reportModal.appendChild(reasonSelect);

    const messageInput = document.createElement('textarea');
    messageInput.placeholder = 'פרט על המקרה';
    messageInput.style.width = '90%';
    messageInput.style.height = '100px';
    messageInput.style.padding = '10px';
    messageInput.style.marginTop = '10px';
    messageInput.style.borderRadius = '5px';
    reportModal.appendChild(messageInput);

    const submitButton = document.createElement('button');
    submitButton.textContent = 'שלח דיווח';
    submitButton.style.backgroundColor = '#f44336';
    submitButton.style.color = 'white';
    submitButton.style.padding = '10px 20px';
    submitButton.style.marginTop = '15px';
    submitButton.style.cursor = 'pointer';
    submitButton.style.borderRadius = '5px';
    submitButton.onclick = function() {
        const reason = reasonSelect.value;
        const message = messageInput.value;
        sendReport(targetPlayer.username, reason, message);
        document.body.removeChild(reportModal);
        document.body.removeChild(overlay);
    };
    reportModal.appendChild(submitButton);

    // כפתור סגירה X
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.style.fontSize = '18px';
    closeButton.style.backgroundColor = 'transparent';
    closeButton.style.border = 'none';
    closeButton.style.cursor = 'pointer';
    closeButton.style.color = '#555';
    closeButton.onclick = function() {
        document.body.removeChild(reportModal);
        document.body.removeChild(overlay);
    };
    reportModal.appendChild(closeButton);

    document.body.appendChild(reportModal);
}


function sendReport(reportedUser, reason, message) {
    const reportData = {
        reportedUser: reportedUser, // המשתמש עליו מדווחים
        attemptedMessage: message,
        reason: reason
    };

    fetch('../game/send_alert.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('הדיווח נשלח בהצלחה!');
        } else {
            alert('שגיאה בשליחת הדיווח: ' + data.message);
        }
    })
    .catch(error => {
        alert('שגיאה בשליחת הדיווח: ' + error);
    });
}


// פונקציה לעדכון פריטים ששחקן לובש לאחר ההחלפה (Firebase ו-MySQL)
function updatePlayerEquippedItems(request, items) {
    items.forEach(item => {
        if (item.isEquipped) {
            // עדכון במאגר הנתונים (למשל, הסרת פריטים שלבשו אותם)
            db.ref(`players/${request.from}/equippedItems/${item.type}`).remove();
            db.ref(`players/${request.to}/equippedItems/${item.type}`).set(item);
        }
    });
}

function updatePlayerEquippedItems(request, items) {
    // נוודא שהפריטים שהוחלפו יורדים מהשחקן במידה והוא לובש אותם
    items.forEach(item => {
        if (equippedItems[item.type] === item.id) {
            equippedItems[item.type] = 0; // הורדת הפריט
            updateEquippedItem(item.type, 0); // עדכון ב-Firebase ובמסד נתונים
        }
    });
}


// פונקציה לתזוזת הדמות
function moveCharacter(event) {
    // כאן תשאר הפונקציה האחראית על תזוזת הדמות שלך
    // לדוגמה, קוד שמחשב לאן הדמות זזה לפי הלחיצה על הקנבס
}




// מניעת תזוזת הדמות אם לוחצים על שחקן אחר
function isClickOnPlayer(mouseX, mouseY, player) {
    const distance = Math.sqrt(Math.pow(mouseX - player.x, 2) + Math.pow(mouseY - player.y, 2));
    return distance < 50; // מרחק לחיצה קרוב לדמות
}

// פונקציה לטעינת תמונות פריט בהתאם לזווית
function preloadItemImage(itemtype, itemid, angle) {
    // אם מדובר בקטגוריית סקייטבורד, הזווית תהיה תמיד 'front'
    let angleDirection = getAngleDirection(angle);
    if (itemtype === 'sk') {
        angleDirection = 'front'; // הגדרת הזווית כ-front עבור סקייטבורד
    }
    
    const cacheKey = `${itemtype}_${itemid}_${angleDirection}`; // מפתח למטמון

    if (!itemImagesCache[cacheKey]) {
        const image = new Image();
        image.src = `../game/items/${itemtype}/${itemid}/${angleDirection}.png`;

        // הוספת מאזין לטעינת התמונה
        image.onload = function() {
            console.log(`Image loaded: ${itemtype}/${itemid}/${angleDirection}`);
        };

        // הוספת טיפול בשגיאה אם התמונה לא נטענת
        image.onerror = function() {
            console.error(`Failed to load image: ${itemtype}/${itemid}/${angleDirection}`);
        };

        itemImagesCache[cacheKey] = image; // שמירת התמונה במטמון
    }
    return itemImagesCache[cacheKey]; // החזרת התמונה מהמטמון
}


function updateUserAreaInDatabase(area) {
    // עדכון ה-area הנוכחי של המשתמש ב-Firebase
    firebase.database().ref(`users/${username}/area`).set(area)
    .then(() => {
        console.log(`User area updated to: ${area}`);
    })
    .catch((error) => {
        console.error(`Error updating user area: ${error}`);
    });
}

function displayUsersInCurrentArea() {
    // קבלת המשתמשים ב-Firebase או במסד הנתונים שרק באותו אזור
    firebase.database().ref('users').once('value').then((snapshot) => {
        const users = snapshot.val();
        const usersInSameArea = Object.keys(users).filter((userKey) => users[userKey].area === currentArea);
        
        // נקה את כל הדמויות והצג רק את המשתמשים באזור הנוכחי
        clearAllPlayers();
        usersInSameArea.forEach((userKey) => {
            renderPlayer(users[userKey]);
        });
    });
}

// פונקציה לקבלת הכיוון לפי זווית
function getAngleDirection(angle) {
    if (angle >= -22.5 && angle < 22.5) {
        return 'right';
    } else if (angle >= 22.5 && angle < 67.5) {
        return 'down_right';
    } else if (angle >= 67.5 && angle < 112.5) {
        return 'front';
    } else if (angle >= 112.5 && angle < 157.5) {
        return 'down_left';
    } else if ((angle >= 157.5 && angle <= 180) || (angle >= -180 && angle < -157.5)) {
        return 'left';
    } else if (angle >= -157.5 && angle < -112.5) {
        return 'up_left';
    } else if (angle >= -112.5 && angle < -67.5) {
        return 'back';
    } else if (angle >= -67.5 && angle < -22.5) {
        return 'up_right';
    }
}
// פונקציה לעדכון האזור ב-Firebase בעת הכניסה הראשונית
function setInitialArea() {
    db.ref(`players/${username}`).update({
        area: 'sea'
    }).then(() => {
        console.log('User area set to sea upon entry.');
    }).catch((error) => {
        console.error('Error setting initial area:', error);
    });
}

    const characterImages = {
        'right': '../game/play/assets/character_right.png',
        'left': '../game/play/assets/character_left.png',
        'up': '../game/play/assets/character_up.png',
        'down': '../game/play/assets/character_down.png',
        'up_right': '../game/play/assets/character_up_right.png',
        'up_left': '../game/play/assets/character_up_left.png',
        'down_right': '../game/play/assets/character_down_right.png',
        'down_left': '../game/play/assets/character_down_left.png',
    };
    

    let character = new Image();
    character.src = characterImages['right']; // תמונה ראשונית של הדמות

    let intervals = {};
    let chatMessages = {};

window.updateCharacterAppearance = function(itemtype, itemid) {
    // וודא ש-id הפריט תקין
    if (!itemtype || itemid === undefined || itemid === null) {
        console.error("Invalid item type or ID:", itemtype, itemid);
        return;
    }

    // בדיקה אם כבר הפריט מוסר, כדי למנוע לולאה אינסופית
    if (equippedItems[itemtype] === itemid && itemid !== 0) {
        console.log(`Removing item ${itemid} from category ${itemtype}`);
        equippedItems[itemtype] = 0;  // הסרה על ידי עדכון ל-0

        // עדכון במסד הנתונים (MySQL ו-Firebase)
        updateEquippedItem(itemtype, 0);
    } else if (equippedItems[itemtype] !== itemid) {
        // אם הפריט לא לבוש, הלבש אותו
        console.log(`Equipping item ${itemid} in category ${itemtype}`);
        equippedItems[itemtype] = itemid;

        // עדכון במסד הנתונים (MySQL ו-Firebase)
        updateEquippedItem(itemtype, itemid);
    }

    // ניטור המצב הנוכחי של הפריטים
    console.log("Current equipped items:", equippedItems);

    // ניקוי המסך ועדכון התמונה
    try {
        updateCanvas();
    } catch (error) {
        console.error("Error updating canvas:", error);
    }
};


    // פונקציה לעדכון מיקום השחקן ב-Firebase כולל זווית
// פונקציה לעדכון מיקום השחקן ב-Firebase כולל זווית וסטטוס מנהל
function updatePlayerPosition(userId, x, y, angle, isMsh) {
    console.log("Updating player position for: " + userId);

    // שליחת העדכון לפיירבייס יחד עם הטוקן
    db.ref('players/' + userId).update({
        x: x,
        y: y,
        angle: angle,
        username: userId,
        isAdmin: isAdmin,  // העברת ערך isAdmin לפיירבייס
        isMsh: isMsh,      // העברת ערך isMsh לפיירבייס
        jumpOffset: jumpOffset,  // עדכון ערך הקפיצה בפיירבייס
        token: token       // העברת הטוקן לפיירבייס כדי לוודא שהמשתמש מאומת
    }, (error) => {
        if (error) {
            console.error('Error updating Firebase:', error);
        } else {
            console.log('Player position updated in Firebase.');
        }
    });
}







// קריאת המידע מהשרת או מה-MySQL יכולה לכלול את הטוקן:
function saveTokenToMySQLAndFirebase(token) {
    // שמירת הטוקן ב-MySQL
    fetch('../game/fetch_user_data.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: token, 
            username: username  // שליחת שם המשתמש
        })
    }).then(response => response.json())
    .then(data => {
        console.log('Token saved in MySQL:', data);
    }).catch(error => {
        console.error('Error saving token in MySQL:', error);
    });

    // שמירת הטוקן ב-Firebase
    const userRef = db.ref('players/' + username);
    userRef.update({
        token: token  // שמירת הטוקן ב-Firebase
    }).then(() => {
        console.log('Token saved in Firebase.');
    }).catch(error => {
        console.error('Error saving token in Firebase:', error);
    });
}

    // מחיקת השחקן וההודעות מ-Firebase בעת יציאה או סגירת הדפדפן
    window.addEventListener('beforeunload', function() {
        // מחיקת השחקן מפיירבייס
        db.ref('players/' + username).remove();

        // מחיקת כל ההודעות הקשורות לשחקן
        db.ref('messages').orderByChild('username').equalTo(username).once('value', (snapshot) => {
            snapshot.forEach(function(childSnapshot) {
                // מחיקת ההודעה עצמה
                childSnapshot.ref.remove().then(() => {
                    console.log("Message removed for user: " + username);
                }).catch(error => {
                    console.error("Error removing message: ", error);
                });
            });
        });
    });

    // מעקב אחר כל השחקנים ב-Firebase ועדכון המיקום והזווית שלהם
    let players = {};
    db.ref('players').on('value', (snapshot) => {
        players = snapshot.val() || {};
        updateCanvas();
    });
// פונקציה לציור הסקייטבורד
function drawSkateboard(ctx, equippedItems, x, y, angle, scaledWidth, scaledHeight, jumpOffset) {
    if (equippedItems.sk && equippedItems.sk !== 0) {
        // אם הפריט הוא סקייטבורד, הזווית תמיד תהיה 'front'
        const skateboardItemImage = preloadItemImage('sk', equippedItems.sk, 'front');

        if (skateboardItemImage.complete && skateboardItemImage.naturalWidth !== 0) {
            // כיוונון מיקום הסקייטבורד טיפה יותר למטה
            const skateboardOffsetY = y - scaledHeight * 0.3 - jumpOffset; // מזיז את הסקייטבורד קצת יותר למטה
            
            ctx.drawImage(skateboardItemImage, x - scaledWidth / 2, skateboardOffsetY, scaledWidth, scaledHeight);
        } else {
            console.error('Failed to load skateboard image');
        }
    }
}





// פונקציה לציור השחקן עם אנימציית נשימה וזווית
function drawPlayer(x, y, username, angle, isAdmin, equippedItems, jumpOffset, isMsh) {
    const scale = 0.8 + (y / canvas.height) * 0.2;
    const scaledWidth = mc.width * scale;
    const scaledHeight = mc.height * scale;

    const adjustedY = y - jumpOffset;  // השתמש בערך jumpOffset שהתקבל מפיירבייס

    drawSkateboard(ctx, equippedItems, x, y, angle, scaledWidth, scaledHeight, jumpOffset);

    const characterImage = getCharacterImage(angle);
    ctx.drawImage(characterImage, x - scaledWidth / 2, adjustedY - scaledHeight / 2, scaledWidth, scaledHeight);


    // פונקציה לקבלת שם הקובץ לפי הזווית
function getItemImageForAngle(itemtype, itemid, angle) {
    let angleDirection = '';

    if (angle >= -22.5 && angle < 22.5) {
        angleDirection = 'right';
    } else if (angle >= 22.5 && angle < 67.5) {
        angleDirection = 'down_right';
    } else if (angle >= 67.5 && angle < 112.5) {
        angleDirection = 'front'; // זווית קדמית
    } else if (angle >= 112.5 && angle < 157.5) {
        angleDirection = 'down_left';
    } else if ((angle >= 157.5 && angle <= 180) || (angle >= -180 && angle < -157.5)) {
        angleDirection = 'left';
    } else if (angle >= -157.5 && angle < -112.5) {
        angleDirection = 'up_left';
    } else if (angle >= -112.5 && angle < -67.5) {
        angleDirection = 'back'; // זווית אחורית
    } else if (angle >= -67.5 && angle < -22.5) {
        angleDirection = 'up_right';
    }

    if (!angleDirection) {
        console.error(`Invalid angle: ${angle} for itemtype ${itemtype}`);
    }

    console.log(`Generated path for ${itemtype}: ../game/items/${itemtype}/${itemid}/${angleDirection}.png`);

    return `../game/items/${itemtype}/${itemid}/${angleDirection}.png`;
}



// ציור הפריטים הנלבשים בהתאם לזווית
if (equippedItems.hd && equippedItems.hd !== 0) {
    const headItemImage = preloadItemImage('hd', equippedItems.hd, angle);
    if (headItemImage.complete && headItemImage.naturalWidth !== 0) {
        ctx.drawImage(headItemImage, x - scaledWidth / 2.05, y - scaledHeight / 2 - jumpOffset, scaledWidth, scaledHeight); // קפיצה
    }
}

// משקפיים
if (equippedItems.gs && equippedItems.gs !== 0) {
    const glassesItemImage = preloadItemImage('gs', equippedItems.gs, angle);
    if (glassesItemImage.complete && glassesItemImage.naturalWidth !== 0) {
        let glassesOffsetX = -2 * scale;
        let glassesOffsetY = -scaledHeight / 2 + 52 * scale - jumpOffset; // קפיצה

        let glassesWidth = scaledWidth * 1.02;
        let glassesHeight = scaledHeight * 0.3;

        ctx.drawImage(glassesItemImage, (x - scaledWidth / 2) + glassesOffsetX, (y - scaledHeight / 2) + glassesOffsetY, glassesWidth, glassesHeight);
    }
}
const itemData = {
    10: { id: 10, name: 'Braids', type: 'hr', isFemaleItem: true },
    11: { id: 11, name: 'Braids1', type: 'hr', isFemaleItem: true },
    12: { id: 12, name: 'Braids2', type: 'hr', isFemaleItem: true },
    13: { id: 13, name: 'Braids3', type: 'hr', isFemaleItem: true },
    14: { id: 14, name: 'Braids4', type: 'hr', isFemaleItem: true },
    15: { id: 15, name: 'Braids5', type: 'hr', isFemaleItem: true },
    16: { id: 16, name: 'Braids6', type: 'hr', isFemaleItem: true },

};

// שיער
if (equippedItems.hr && equippedItems.hr !== 0) {
    const hairItemImage = preloadItemImage('hr', equippedItems.hr, angle);
    if (hairItemImage.complete && hairItemImage.naturalWidth !== 0) {
        const hairItemId = equippedItems.hr;

        // בדוק אם ה-ID קיים ב-itemData
        const item = itemData[hairItemId];

        const hairOffsetX = -2 * scale;
        let hairOffsetY = -scaledHeight / 10 - jumpOffset; // קפיצה רגילה

        let hairWidth = scaledWidth * 1.07;
        let hairHeight = scaledHeight * 0.5; // ברירת מחדל

        // אם הפריט הוא של בנות, נגדיל את הגובה, הרוחב ונזיז למעלה
        if (item && item.isFemaleItem) {
            hairWidth = scaledWidth * 1.15;  // מעט יותר רחב
            hairHeight = scaledHeight * 0.75; // מעט יותר ארוך
            hairOffsetY -= scaledHeight * 0.12; // הזזת השיער עוד קצת למעלה
        }

        // ציור התמונה בגודל ובמיקום המתאימים
        ctx.drawImage(hairItemImage, (x - scaledWidth / 2) + hairOffsetX, (y - scaledHeight / 2) + hairOffsetY, hairWidth, hairHeight);
    }
}




// חולצות
if (equippedItems.st && equippedItems.st !== 0) {
    const shirtItemImage = preloadItemImage('st', equippedItems.st, angle);
    if (shirtItemImage.complete && shirtItemImage.naturalWidth !== 0) {
        let shirtOffsetX = 8 * scale;
        let shirtOffsetY = 41 * scale - jumpOffset; // קפיצה

        let shirtWidth = scaledWidth * 0.73;
        let shirtHeight = scaledHeight * 0.32;

        if (angle >= -22.5 && angle < 22.5 || (angle >= 157.5 && angle <= 180) || (angle >= -180 && angle < -157.5)) {
            shirtWidth = scaledWidth * 0.60;
            shirtHeight = scaledHeight * 0.28;
            shirtOffsetX += 3 * scale;
            shirtOffsetY += 3.9 * scale;
        }

        ctx.drawImage(shirtItemImage, (x - scaledWidth / 2) + shirtOffsetX, (y - scaledHeight / 2) + shirtOffsetY, shirtWidth, shirtHeight);
    }
}

// מכנסיים
if (equippedItems.ps && equippedItems.ps !== 0) {
    const pantsItemImage = preloadItemImage('ps', equippedItems.ps, angle);
    if (pantsItemImage.complete && pantsItemImage.naturalWidth !== 0) {
        let pantsOffsetX = 14 * scale;
        let pantsOffsetY = 56 * scale - jumpOffset; // קפיצה

        let pantsWidth = scaledWidth * 0.50;
        let pantsHeight = scaledHeight * 0.18;

        if (angle >= -22.5 && angle < 22.5 || (angle >= 157.5 && angle <= 180) || (angle >= -180 && angle < -157.5)) {
            pantsWidth = scaledWidth * 0.45;
            pantsHeight = scaledHeight * 0.18;
            pantsOffsetX += 0 * scale;
            pantsOffsetY += 0 * scale;
        }

        ctx.drawImage(pantsItemImage, (x - scaledWidth / 2) + pantsOffsetX, (y - scaledHeight / 2) + pantsOffsetY, pantsWidth, pantsHeight);
    }
}
// שרשראות
if (equippedItems.nk && equippedItems.nk !== 0) {
    const necklaceItemImage = preloadItemImage('nk', equippedItems.nk, angle);
    if (necklaceItemImage.complete && necklaceItemImage.naturalWidth !== 0) {
        let necklaceOffsetX = 18 * scale;
        let necklaceOffsetY = 45 * scale - jumpOffset; // הזזת השרשרת למטה יותר

        let necklaceWidth = scaledWidth * 0.50; // הרחבת השרשרת משמעותית
        let necklaceHeight = scaledHeight * 0.12;

        // התאמות לפי הזווית
        if (angle >= -22.5 && angle < 22.5) {
            // הדמות פונה ימינה, זז ימינה
            necklaceOffsetX += -2 * scale;
        } else if ((angle >= 157.5 && angle <= 180) || (angle >= -180 && angle < -157.5)) {
            // הדמות פונה שמאלה, זז שמאלה
            necklaceOffsetX -= 4 * scale;
        } else {
            // זוויות אחרות (קדימה/אחורה) 
            necklaceWidth = scaledWidth * 0.45; // הרחבה מתונה יותר בזוויות קדימה/אחורה
            necklaceHeight = scaledHeight * 0.12;
        }

        // ציור השרשרת
        ctx.drawImage(necklaceItemImage, (x - scaledWidth / 2) + necklaceOffsetX, (y - scaledHeight / 2) + necklaceOffsetY, necklaceWidth, necklaceHeight);
    }
}

// כובעים
if (equippedItems.ht && equippedItems.ht !== 0) {
    const hatItemImage = preloadItemImage('ht', equippedItems.ht, angle);
    if (hatItemImage.complete && hatItemImage.naturalWidth !== 0) {
        let hatOffsetX = -2 * scale;
        let hatOffsetY = -scaledHeight / 4.2 - jumpOffset; // קפיצה

        let hatWidth = scaledWidth * 1.05;
        let hatHeight = scaledHeight * 0.6;

        if (angle >= -22.5 && angle < 22.5 || (angle >= 157.5 && angle <= 180) || (angle >= -180 && angle < -157.5)) {
            hatWidth = scaledWidth * 1.05;
            hatHeight = scaledHeight * 0.5;
            hatOffsetY += 2; // הוספנו 10 פיקסלים כדי להזיז את הכובע למטה יותר
        }

        ctx.drawImage(hatItemImage, (x - scaledWidth / 2) + hatOffsetX, (y - scaledHeight / 2) + hatOffsetY, hatWidth, hatHeight);
    }
}



    // ציור השם של השחקן והצמדת סמל ה-admin לשם
    const textWidth = ctx.measureText(username).width;  // חישוב הרוחב של השם
    const totalWidth = textWidth + 24 * scale;  // חישוב הרוחב הכולל של השם והסמל (24px הוא הגודל המשוער של הסמל)
    const nameX = x - totalWidth / 2;  // מיקום אופקי של השם יחד עם הסמל
    const nameY = y + scaledHeight / 2 + 20 * scale;  // מיקום ורטיקלי של השם
    const iconX = x - 10 * scale;  // הסמל יופיע במרכז מתחת לשם

    // ציור השם של השחקן
    ctx.font = (16 * scale) + "px Arial";
    ctx.textAlign = "center";
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;

    // אם המשתמש הוא מנהל, השם יהיה אדום, אחרת שחור
    ctx.fillStyle = isAdmin ? "#DDA0DD" : isMsh ? "#429bf5" : "black"; // כחול למשגיח, סגול למנהל, שחור רגיל
    ctx.strokeText(username, x, y + scaledHeight / 2 + 20 * scale);
    ctx.fillText(username, x, y + scaledHeight / 2 + 20 * scale);

// ציור סמל ה-admin או ה-msh מתחת לשם אם המשתמש הוא מנהל או משגיח
if (isAdmin) {
    const iconSize = 20 * scale;  // גודל הסמל מותאם לסקייל
    const iconX = x - iconSize / 2;  // מרכז הסמל ביחס למיקום השם
    const iconY = nameY + 10 * scale;  // שמירת הסמל מתחת לשם עם מרווח קל

    ctx.drawImage(adminIcon, iconX, iconY, iconSize, iconSize);
} else if (isMsh) { // אם השחקן הוא משגיח, נציג את סמל המשגיח
    const iconSize = 20 * scale;  // גודל הסמל מותאם לסקייל
    const iconX = x - iconSize / 2;  // מרכז הסמל ביחס למיקום השם
    const iconY = nameY + 10 * scale;  // שמירת הסמל מתחת לשם עם מרווח קל

    ctx.drawImage(mshIcon, iconX, iconY, iconSize, iconSize);
}
}





function equipItem(itemtype, itemid) {
    console.log("Equipping item:", itemtype, itemid);

    // עדכון הפריט הנלבש בלקוח
    updateCharacterAppearance(itemtype, itemid);

    // שליחת עדכון לשרת ולפיירבייס
    updateEquippedItem(itemtype, itemid);
}

// בדוק שאין הגדרה כפולה של userRef
function loadEquippedItems() {
    console.log("Attempting to load equipped items from MySQL and Firebase...");

    const userRef = db.ref('players/' + username + '/equippedItems');

    const defaultItems = {
        hd: 0,
        ht: 0,
        hr: 0,
        st: 0,
        ps: 0,
        nk: 0,
        gs: 0,
        sk: 0,
        sz: 0
    };

    const equippedItemsWithDefaults = { ...defaultItems, ...equippedItems };

    console.log("Default items:", defaultItems);
    console.log("Loaded equipped items from MySQL:", equippedItems); // בדוק את הנתונים שנשלפים מ-MySQL

    userRef.update(equippedItemsWithDefaults).then(() => {
        console.log("Equipped items loaded into Firebase with default values:", equippedItemsWithDefaults);
    }).catch(error => {
        console.error("Error loading equipped items into Firebase:", error);
    });
}




function updateEquippedItem(itemtype, itemid) {
    // עדכון ב-Firebase
    const userRef = db.ref('players/' + username + '/equippedItems');
    console.log("Attempting to update Firebase with item:", itemtype, itemid); // לוג לעדכון הפריט

    let updateData = {};
    updateData[itemtype] = itemid;

    userRef.update(updateData).then(() => {
console.log(`Item ${itemid} of type ${itemtype} equipped successfully in Firebase.`);
    }).catch(error => {
        console.error('Error updating item in Firebase:', error);
    });

    // עדכון המראה של הדמות לאחר החלפת פריט
    updateCharacterAppearance(itemtype, itemid);

    // עדכון במשתנה המקומי עבור הדמות
    equippedItems[itemtype] = itemid;
    updateCanvas(); // עדכון המסך כדי להציג את הפריטים הנלבשים
}

// כניסה לבית של משתמש אחר
function enterOtherHouse(targetPlayer) {
    const otherHouseImage = new Image();
    otherHouseImage.src = '../game/rooms/house.png'; // קובץ הבית של השחקן

    otherHouseImage.onload = function() {
        currentBackground = otherHouseImage; // עדכון הרקע לבית של השחקן האחר
        drawAllPlayers(); // ציור כל השחקנים בבית
        updateCanvas();   // עדכון הקנבס
    };

    // עדכון האזור בפיירבייס לבית של השחקן האחר
    db.ref(`players/${username}`).update({
        area: `${targetPlayer.username}'s house`
    }).then(() => {
        console.log(`נכנסת לבית של ${targetPlayer.username}.`);
    }).catch(error => {
        console.error('שגיאה בכניסה לבית של משתמש אחר:', error);
    });
}

// פונקציה להצגת סימן בית מעל דמויות המשתמשים שנמצאים בבית
function drawHouseSymbol(x, y, targetPlayer) {
    const iconSize = 30; // גודל האייקון
    const radius = 20; // רדיוס העיגול

    // ציור עיגול לבן
    ctx.beginPath();
    ctx.arc(x, y - 50, radius, 0, 2 * Math.PI, false); // מיקום מעל השחקן
    ctx.fillStyle = 'white'; // צבע העיגול
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000'; // צבע גבול העיגול (שחור)
    ctx.stroke();
    ctx.closePath();

    // ציור אייקון בית (אימוג'י) במרכז העיגול
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = '#000'; // צבע האימוג'י
    ctx.fillText('🏠', x, y - 50); // מיקום האייקון במרכז העיגול

    // מאזין ללחיצה על האייקון כדי להיכנס לבית
    canvas.addEventListener('click', function(event) {
        const mousePos = getMousePosInCanvas(event);
        const distance = Math.sqrt(Math.pow(mousePos.x - x, 2) + Math.pow(mousePos.y - (y - 50), 2));

        // אם המשתמש לחץ על האזור של העיגול
        if (distance < radius) {
            enterOtherHouse(targetPlayer); // קריאה לפונקציה שמכניסה לבית של השחקן
        }
    });
}


// טען את סמל ה-admin וסמל ה-msh פעם אחת בלבד
const adminIcon = new Image();
adminIcon.src = '../game/play/assets/admin-icon.png';

const mshIcon = new Image();
mshIcon.src = '../game/play/assets/msh-icon.png';



function drawAllPlayers() {
    const sortedPlayers = Object.values(players).sort((a, b) => a.y - b.y);  // מיון לפי Y

    for (const player of sortedPlayers) {
        if (player.area === currentArea) {
            const equippedItems = player.equippedItems || {};

            // שימוש ב-jumpOffset מהנתונים בפיירבייס
            const playerJumpOffset = player.jumpOffset || 0;

            // ציור הדמות עם הקפיצה
            drawPlayer(player.x, player.y, player.username, player.angle, player.isAdmin, equippedItems, playerJumpOffset, player.isMsh);

            // הצגת הודעות צ'אט אם יש
            if (chatMessages[player.username]) {
                const chatData = chatMessages[player.username];
                const currentTime = Date.now();

                if (currentTime - chatData.timestamp < 8000) {
                    displayChatBubble(player.x, player.y, chatData.message, chatData.isAdmin, chatData.isMsh);
                } else {
                    delete chatMessages[player.username];
                }
            }

            // אם השחקן נמצא בבית, נציג מעליו את סמל הבית
            if (player.area.includes('house')) {
                drawHouseSymbol(player.x, player.y, player); // ציור סמל הבית עם אפשרות ללחיצה
            }
        }
    }
}




// מעקב אחרי הודעות חדשות שמגיעות מ-Firebase כדי להוסיף אותן למערך המקומי
db.ref('messages').on('child_added', (snapshot) => {
    const data = snapshot.val();

    // ודא שההודעה מכילה את שם המשתמש ואת ההודעה עצמה
    if (data && data.message && data.username) {
        // שמור בצד הלקוח את ההודעה
        chatMessages[snapshot.key] = {
            message: data.message,
            username: data.username,
            isAdmin: data.isAdmin,
            isMsh: data.isMsh,
            timestamp: Date.now()
        };

        // עדכון הקנבס להצגת ההודעה על המסך
        updateCanvas();
    } else {
        console.error("ההודעה לא תקינה או חסרים בה נתונים:", snapshot.val());
    }
});



function displayChatBubble(x, y, message, isAdmin, isMsh) {
    const maxWidth = 150; // רוחב מקסימלי של הבועה לפני שמתחילה שבירת שורות
    const bubblePadding = 5;
    const lineHeight = 16;
    const triangleHeight = 5; // גובה החץ של הבועה

    // פונקציה לשבירת השורות מבלי לחתוך מילים באמצע
    function wrapText(ctx, text, maxWidth) {
        let words = text.split(' ');
        let line = '';
        let lines = [];

        words.forEach((word) => {
            const testLine = line + word + ' ';
            const testWidth = ctx.measureText(testLine).width;

            if (testWidth > maxWidth && line !== '') {
                lines.push(line.trim());
                line = word + ' ';
            } else {
                line = testLine;
            }
        });

        lines.push(line.trim()); // להוסיף את השורה האחרונה
        return lines;
    }

    // חשב את השורות של ההודעה
    const lines = wrapText(ctx, message, maxWidth);
    const bubbleWidth = Math.max(...lines.map(line => ctx.measureText(line).width)) + 2 * bubblePadding;
    const bubbleHeight = lines.length * lineHeight + 2 * bubblePadding + triangleHeight; // נוסיף את גובה החץ לחישוב גובה הבועה
    const bubbleX = x - bubbleWidth / 2;
    const bubbleY = y - mc.height - bubbleHeight + 20; // הזזת הבועה מעל הראש של הדמות

    ctx.lineJoin = "round";


    // אם msh = 1, נגדיר צבע ירוק לבועה ולשם
    if (isMsh) {
        ctx.fillStyle = 'rgba(66, 155, 245, 0.9)';  // צבע כחול (#429bf5) לבועה
    } else if (isAdmin) {
        ctx.fillStyle = 'rgba(186, 85, 211, 0.8)'; // סגול בהיר יותר
    } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'; // צבע שחקן רגיל
    }

    // ציור הבועה
    ctx.beginPath();
    ctx.moveTo(bubbleX + 10, bubbleY);
    ctx.lineTo(bubbleX + bubbleWidth - 10, bubbleY);
    ctx.quadraticCurveTo(bubbleX + bubbleWidth, bubbleY, bubbleX + bubbleWidth, bubbleY + 10);
    ctx.lineTo(bubbleX + bubbleWidth, bubbleY + bubbleHeight - triangleHeight - 10);
    ctx.quadraticCurveTo(bubbleX + bubbleWidth, bubbleY + bubbleHeight - triangleHeight, bubbleX + bubbleWidth - 10, bubbleY + bubbleHeight - triangleHeight);
    ctx.lineTo(x + 10, bubbleY + bubbleHeight - triangleHeight); // ציור החלק התחתון של הבועה
    ctx.lineTo(x, bubbleY + bubbleHeight); // חץ שיוצא מהבועה לדמות
    ctx.lineTo(x - 10, bubbleY + bubbleHeight - triangleHeight); // חיבור החץ לבועה
    ctx.lineTo(bubbleX + 10, bubbleY + bubbleHeight - triangleHeight);
    ctx.quadraticCurveTo(bubbleX, bubbleY + bubbleHeight - triangleHeight, bubbleX, bubbleY + bubbleHeight - triangleHeight - 10);
    ctx.lineTo(bubbleX, bubbleY + 10);
    ctx.quadraticCurveTo(bubbleX, bubbleY, bubbleX + 10, bubbleY);
    ctx.closePath();
    ctx.fill();
    ctx.direction = 'rtl';  // כיוון הטקסט מימין לשמאל
    ctx.textAlign = 'center';  // יישור טקסט למרכז

    // שינוי צבע הטקסט בהתאם למשתמש (msh או admin)
    ctx.fillStyle = (isMsh || isAdmin) ? 'white' : 'purple';

    // ציור הטקסט השבור לשורות בתוך הבועה במרכז
    lines.forEach((line, index) => {
        ctx.fillText(line, x, bubbleY + bubblePadding + (index + 1) * lineHeight);
    });
}





function sendMessage(message) {
    const messageRef = db.ref('messages').push(); // יצירת הודעה חדשה
    const messageId = messageRef.key;

    // שמירת ההודעה ב-Firebase
    messageRef.set({
        username: username,
        message: message,
        isAdmin: isAdmin,
        isMsh: isMsh,  // ודא שאתה שולח את isMsh כאן
        messageId: messageId, // שמירת המפתח ב-Firebase
        timestamp: Date.now()  // זמן שליחה
    }).then(() => {
        console.log("Message sent: ", message);

        // מחיקת ההודעה מיידית מ-Firebase לאחר השליחה
        messageRef.remove().then(() => {
            console.log("Message immediately removed from Firebase.");
        }).catch(error => {
            console.error("Error removing message: ", error);
        });

        // שמירה במערך המקומי רק לדמות ששלחה את ההודעה
        chatMessages[username] = {
            message: message,
            isAdmin: isAdmin,
            isMsh: isMsh,  // שמירת המידע עבור הצ'אט
            timestamp: Date.now()  // שמירת הזמן כדי לאפס את 8 השניות
        };

        updateCanvas();  // עדכון המסך
    }).catch(error => {
        console.error("Error sending message: ", error);
    });
}


// מעקב אחרי הודעות חדשות שמגיעות מ-Firebase כדי להוסיף אותן למערך המקומי לכל המשתמשים
db.ref('messages').on('child_added', (snapshot) => {
    const data = snapshot.val();

    // ודא שההודעה מכילה את שם המשתמש, ההודעה, ופרטים נוספים
    if (data && data.message && data.username) {
        // שמירה של ההודעה במערך המקומי לכל משתמש ששלח אותה
        chatMessages[data.username] = {
            message: data.message,
            isAdmin: data.isAdmin || false,  // ודא ש-isAdmin עובר נכון
            isMsh: data.isMsh || false,  // ודא ש-isMsh עובר נכון
            timestamp: Date.now()  // שמירת הזמן כדי לדעת מתי למחוק
        };

        // עדכון הקנבס להצגת ההודעות
        updateCanvas();
    } else {
        console.error("ההודעה לא תקינה או חסרים בה נתונים:", snapshot.val());
    }
});

// מאזין לכפתור "שליחה"
document.getElementById("sendButton").addEventListener("click", function(event) {
    event.preventDefault(); // מונע רענון דף או פעולה ברירת מחדל של הכפתור
    const messageInput = document.getElementById('chatInput');
    const message = messageInput.value.trim(); // הסרת רווחים מיותרים

    // ביטוי רגולרי לאיתור סימנים מיוחדים שאינם מותרים
const specialCharsPattern = /[^a-zA-Z0-9א-ת!?,.\s😊😂😍😢😎👍)(:❤️🤔🤗🙌😡🎉😴🤩💬]/;

    if (message.length > 50) {
        alert("ההודעה חייבת להיות פחות מ-50 תווים.");
    } else if (message.length === 0) {
        alert("לא ניתן לשלוח הודעה ריקה.");
    } else if (specialCharsPattern.test(message)) {
        alert("ההודעה מכילה סימנים אסורים.");
    } else if (containsProfanity(message)) {
        alert("ההודעה מכילה מילים לא הולמות!");
        messageInput.value = ""; // נקה את שדה ההודעה אם יש מילים לא הולמות
    } else {
        // קריאה לפונקציה לשליחת ההודעה
        sendMessage(message);
        // ניקוי שדה הקלט לאחר השליחה
        messageInput.value = "";
    }
});


// מאזין לאנטר במקלדת לשליחת הודעה
document.getElementById('chatInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // מונע שליחת הודעה בלחיצה על אנטר אוטומטית
        const messageInput = document.getElementById('chatInput');
        const message = messageInput.value.trim();

        // ביטוי רגולרי לאיתור סימנים מיוחדים שאינם מותרים
const specialCharsPattern = /[^a-zA-Z0-9א-ת!?,.\s😊😂😍😢😎👍)(:❤️🤔🤗🙌😡🎉😴🤩💬]/;

        if (message.length > 50) {
            alert("ההודעה חייבת להיות פחות מ-50 תווים.");
        } else if (message.length === 0) {
            alert("לא ניתן לשלוח הודעה ריקה.");
        } else if (specialCharsPattern.test(message)) {
            alert("ההודעה מכילה סימנים אסורים.");
        } else if (containsProfanity(message)) {
            alert("ההודעה מכילה מילים לא הולמות!");
            messageInput.value = ""; // נקה את שדה ההודעה אם יש מילים לא הולמות
        } else {
            // קריאה לפונקציה לשליחת ההודעה
            sendMessage(message);
            messageInput.value = "";
        }
    }
});


function updateCanvas() {
    // ניקוי הקנבס
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ציור הרקע הנוכחי
    ctx.drawImage(currentBackground, 0, 0, canvas.width, canvas.height); 

    // ציור כל השחקנים
    drawAllPlayers();


    // ציור האתרוג אם הוא נראה
    if (isEtrogVisible) {
        ctx.drawImage(etrog, etrogX, etrogY, 50, 50);  // ציור האתרוג בגודל 50x50 במיקום רנדומלי
    }
}

etrogInterval = setTimeout(spawnEtrog, 10000 + Math.random() * 5000); // אתרוג ראשון יופיע לאחר 10-15 שניות


    
let inactivityTimer;

// פונקציה לאיפוס טיימר חוסר פעילות
function resetInactivityTimer() {
    // אם יש טיימר קיים, נבטל אותו
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
    }
    
    // טיימר חדש שמנתק את המשתמש לאחר 20 דקות (1,200,000 מילישניות)
    inactivityTimer = setTimeout(() => {
        disconnectUser();
    }, 1200000); // 20 דקות במילישניות
}

// פונקציה לניתוק המשתמש
function disconnectUser() {
    // מחיקת השחקן מ-Firebase
    db.ref('players/' + username).remove()
    .then(() => {
        console.log("Player removed from Firebase.");
        
        // ניתוב מחדש לתיקיית המשחק
        window.location.href = '../game/'; // ניתוב מחדש לתיקיית המשחק
    })
    .catch((error) => {
        console.error("Error removing player from Firebase:", error);
    });
}

// קריאה לפונקציה resetInactivityTimer כאשר יש תנועה של השחקן
canvas.addEventListener('click', function(event) {
    resetInactivityTimer(); // איפוס הטיימר בכל לחיצה
    const mousePos = getMousePosInCanvas(event);
    calWalk(mousePos.x, mousePos.y);
});

// קריאה לפונקציה resetInactivityTimer בכל תנועה של השחקן
document.addEventListener('keydown', function(event) {
    resetInactivityTimer(); // איפוס הטיימר בכל לחיצה על מקש
});

    // חישוב יחס גודל המסך למיקום הלחיצה
    function getMousePosInCanvas(event) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width; // יחס הרוחב
        const scaleY = canvas.height / rect.height; // יחס הגובה

        const mouseX = (event.clientX - rect.left) * scaleX;
        const mouseY = (event.clientY - rect.top) * scaleY;

        return { x: mouseX, y: mouseY };
    }

    function getCharacterImage(angle) {
        const image = new Image(); // יצירת אובייקט תמונה חדש

        if (angle >= -22.5 && angle < 22.5) {
            image.src = characterImages['right'];
        } else if (angle >= 22.5 && angle < 67.5) {
            image.src = characterImages['down_right'];
        } else if (angle >= 67.5 && angle < 112.5) {
            image.src = characterImages['down'];
        } else if (angle >= 112.5 && angle < 157.5) {
            image.src = characterImages['down_left'];
        } else if ((angle >= 157.5 && angle <= 180) || (angle >= -180 && angle < -157.5)) {
            image.src = characterImages['left'];
        } else if (angle >= -157.5 && angle < -112.5) {
            image.src = characterImages['up_left'];
        } else if (angle >= -112.5 && angle < -67.5) {
            image.src = characterImages['up'];
        } else if (angle >= -67.5 && angle < -22.5) {
            image.src = characterImages['up_right'];
        }

        return image; // החזרת אובייקט תמונה
    }

    function calculateAngle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    }

let jumpAmplitude = 5;  // גובה הקפיצה (אפשר גם להקטין את זה כדי לעשות קפיצות קטנות יותר)
let jumpSpeed = 0.022;   // מהירות הקפיצה, ככל שהמספר קטן יותר הקפיצות יותר איטיות
let jumpOffset = 0;     // תזוזה אנכית נוכחית של הדמות

function calWalk(px, py) {
    // בדיקה אם הלחיצה היא על שחקן אחר
    let clickedOnPlayer = false;
    for (const player of Object.values(players)) {
        // בדיקה אם הלחיצה היא על שחקן שנמצא באותו אזור ולא על השחקן שלך
        if (player.area === currentArea && isClickOnPlayer(px, py, player) && player.username !== username) {
            openUserProfile(player); // פתיחת חלון פרופיל של השחקן שנלחץ
            clickedOnPlayer = true; // סימון שנלחץ שחקן אחר
            break; // יציאה מהלולאה כי לא צריך לבדוק עוד שחקנים
        }
    }

    // אם נלחץ על שחקן אחר, לא נבצע תזוזה
    if (clickedOnPlayer) {
        return; // יוצאים מהפונקציה מבלי להמשיך
    }

    clearInterval(intervals['player']);
    const speed = 7;

    mc.angle = calculateAngle(mc.x, mc.y, px, py); // חישוב זווית ההליכה
    character.src = getCharacterImage(mc.angle).src; // החלפת תמונה בהתאם לזווית

    intervals['player'] = setInterval(function() {
        let dx = px - mc.x;
        let dy = py - mc.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // עדכון הקפיצה כל עוד הדמות זזה
        jumpOffset = Math.sin(Date.now() * jumpSpeed) * jumpAmplitude;

        if (distance > speed) {
            mc.x += (dx / distance) * speed;
            mc.y += (dy / distance) * speed;
        } else {
            mc.x = px;
            mc.y = py;
            jumpOffset = 0; // איפוס הקפיצה כשהדמות מגיעה לנקודת היעד
            clearInterval(intervals['player']);
        }

        // עדכון המיקום והזווית ב-Firebase, כולל הקפיצה לאפס לאחר עצירה
        updatePlayerPosition(username, mc.x, mc.y, mc.angle, isMsh); // כולל את המשתנה isMsh בנתונים
        updateCanvas();
    }, 20);
}


// פונקציה לבדיקת לחיצה על שחקן
function isClickOnPlayer(mouseX, mouseY, player) {
    const distance = Math.sqrt(Math.pow(mouseX - player.x, 2) + Math.pow(mouseY - player.y, 2));
    return distance < 50; // מרחק לחיצה קרוב לדמות
}




    // מאזין ללחיצה על הקנבס ומחשב את מיקום הלחיצה בצורה מדויקת
    canvas.addEventListener('click', function(event) {
        const mousePos = getMousePosInCanvas(event);
        calWalk(mousePos.x, mousePos.y);
    });

background.onload = function() {
    character.onload = function() {
        updatePlayerPosition(username, mc.x, mc.y, mc.angle, isMsh); // כולל את המשתנה isMsh בנתונים
        updateCanvas();
    };
    updateCanvas(); // קרא לפונקציה זו לאחר טעינת הרקע
};


    setInterval(() => {
        updateCanvas();
    }, 20);
};
