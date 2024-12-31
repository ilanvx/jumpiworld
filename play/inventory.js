window.addEventListener("load",function(){function e(){let e={hd:e.hd,ht:e.ht,hr:e.hr,st:e.st,ps:e.ps,nk:e.nk,gs:e.gs,sk:e.sk,sz:e.sz};db.ref(`players/${username}/equippedItems`).set(e).then(()=>{console.log("All equipped items updated in Firebase.")}).catch(e=>{console.error("Error updating all equipped items in Firebase:",e)})}console.log("inventory.js loaded"),fetch("../game/firebaseConfig.php").then(e=>e.json()).then(e=>{firebase.apps.length?(console.log("Firebase app already initialized."),db=firebase.database()):(firebase.initializeApp(e),db=firebase.database(),console.log("Firebase initialized with PHP config.")),function e(){if(!window.userItems||0===window.userItems.length){console.error("No items found or userItems is null");return}let t=document.createElement("div");t.id="inventoryModal",t.style.display="none",t.style.position="fixed",t.style.top="50%",t.style.left="50%",t.style.transform="translate(-50%, -50%)",t.style.backgroundColor="white",t.style.padding="20px",t.style.borderRadius="15px",t.style.boxShadow="0 4px 8px rgba(0, 0, 0, 0.2)",t.style.zIndex="1000",t.style.maxHeight="400px",t.style.overflowY="auto",t.style.transition="all 0.3s ease-in-out";let s=document.createElement("div");s.style.position="fixed",s.style.top="0",s.style.left="0",s.style.width="100%",s.style.height="100%",s.style.backgroundColor="rgba(0, 0, 0, 0.5)",s.style.zIndex="999",s.style.display="none",document.body.appendChild(s),document.body.appendChild(t);let r=document.createElement("span");r.innerText="\xd7",r.style.position="sticky",r.style.top="5px",r.style.right="5px",r.style.fontSize="20px",r.style.width="30px",r.style.height="30px",r.style.display="flex",r.style.alignItems="center",r.style.justifyContent="center",r.style.cursor="pointer",r.style.backgroundColor="#ff3333",r.style.color="#ffffff",r.style.border="2px solid #fff",r.style.borderRadius="50%",r.style.boxShadow="0 4px 12px rgba(0, 0, 0, 0.2)",r.style.transition="transform 0.2s ease, background-color 0.2s ease",r.style.zIndex="10000",r.onmouseover=()=>{r.style.transform="scale(1.1)",r.style.backgroundColor="#ff6666"},r.onmouseout=()=>{r.style.transform="scale(1)",r.style.backgroundColor="#ff3333"},r.onclick=()=>{t.style.display="none",s.style.display="none"},t.appendChild(r);let i={hr:"\uD83D\uDC87 שיערות",ht:"\uD83C\uDFA9 כובעים",st:"\uD83D\uDC55 חולצות",ps:"\uD83D\uDC56 מכנסיים",nk:"\uD83D\uDCFF שרשראות",gs:"\uD83D\uDD76 משקפיים",hd:"\uD83E\uDDCD צבעי גוף",sk:"\uD83D\uDEF9 אביזרי תחתית",sz:"\uD83C\uDF92 אביזרים"},l=document.createElement("div");function n(e,t){fetch("../game/update_item.php",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({itemtype:e,itemid:t})}).then(e=>e.json()).then(s=>{s.success?(console.log(`Item ${t} updated successfully in MySQL.`),db&&db.ref?db.ref(`players/${username}/equippedItems`).update({[e]:t}).then(()=>{console.log(`Firebase updated with item ${t} under ${username}/equippedItems`),window.equippedItems[e]=t}).catch(e=>{console.error("Error updating Firebase:",e)}):console.error("Firebase database reference is not defined properly.")):console.error("Error equipping item in MySQL:",s.message)}).catch(e=>{console.error("Error:",e)})}l.id="categoryButtonsContainer",l.style.display="flex",l.style.justifyContent="center",l.style.gap="10px",l.style.marginBottom="10px",Object.keys(i).forEach(e=>{let s=document.createElement("button");s.innerText=i[e],s.style.padding="10px",s.style.border="none",s.style.borderRadius="10px",s.style.backgroundColor="#007bff",s.style.color="white",s.style.cursor="pointer",s.style.transition="background-color 0.3s",s.style.fontSize="16px",s.onmouseover=()=>{s.style.backgroundColor="#0056b3"},s.onmouseout=()=>{s.style.backgroundColor="#007bff"},s.addEventListener("click",()=>{console.log(`Opening ${i[e]} inventory`),function e(s){fetch("../game/get_item_rarity.php").then(e=>e.json()).then(e=>{for(console.log("Rarity data received:",e);t.childNodes.length>2;)t.removeChild(t.lastChild);let r={};window.userItems.forEach(e=>{let t=`${e.itemtype}-${e.itemid}`;r[t]?r[t].count+=1:r[t]={...e,count:1}});let i=Object.values(r).filter(e=>e.itemtype===s);if(0===i.length){let l=document.createElement("p");l.innerText="אין פריטים בקטגוריה זו.",t.appendChild(l);return}let o=document.createElement("div");o.style.display="grid",o.style.gridTemplateColumns="repeat(4, 1fr)",o.style.gridGap="10px",i.forEach(t=>{let s=document.createElement("div");s.classList.add("inventory-item"),s.style.padding="10px",s.style.border="1px solid #ccc",s.style.borderRadius="10px",s.style.textAlign="center",s.style.cursor="pointer",s.style.position="relative",s.style.transition="transform 0.2s",s.onmouseover=()=>{s.style.transform="scale(1.05)"},s.onmouseout=()=>{s.style.transform="scale(1)"};let r=new Image;r.src=`../game/items/${t.itemtype}/${t.itemid}/front.png`,r.style.width="50px",r.style.height="50px",r.style.marginBottom="5px",r.style.objectFit="contain",s.appendChild(r);let i=e[`${t.itemtype}-${t.itemid}`]||0;if(i>0&&s.classList.add(`rarity-${i}`),t.count>1){let l=document.createElement("span");l.innerText=t.count,l.style.position="absolute",l.style.top="5px",l.style.right="5px",l.style.backgroundColor="red",l.style.color="white",l.style.padding="3px",l.style.borderRadius="50%",l.style.fontSize="12px",l.style.fontWeight="bold",l.style.minWidth="20px",l.style.textAlign="center",s.appendChild(l)}s.addEventListener("click",()=>{(function e(t,s){console.log(`Equipping or removing item: ${t}, ${s}`),window.equippedItems||(window.equippedItems={});let r=window.equippedItems[t]||0;r===s?(console.log("Item already equipped, removing item."),n(t,0),updateCharacterAppearance(t,0)):(console.log("Equipping item."),n(t,s),updateCharacterAppearance(t,s))})(t.itemtype,t.itemid)}),o.appendChild(s)}),t.appendChild(o)}).catch(e=>console.error("Error fetching rarity data:",e))}(e)}),l.appendChild(s)}),t.appendChild(l),document.getElementById("inventoryButton").addEventListener("click",function(){console.log("Opening inventory modal"),fetch("../game/get_users_items.php").then(e=>e.json()).then(e=>{window.userItems=e,console.log("Items updated from MySQL:",e)}).catch(e=>{console.error("Error fetching updated items from MySQL:",e)}).then(()=>{s.style.display="block",t.style.display="block"})})}()}),db.ref(`players/${username}/equippedItems`).once("value").then(e=>{e.exists()?console.log("equippedItems found for user:",username):console.log("No equippedItems found for user, creating it.")}).catch(e=>{console.error("Error checking equippedItems in Firebase:",e)})});