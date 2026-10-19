const SERVICES = [
  {id:"laptop", name:"Laptop Repair", icon:"▣", price:499, time:"1–2 days", desc:"Hardware checks, performance issues, and common laptop faults."},
  {id:"desktop", name:"Desktop Repair", icon:"▤", price:399, time:"1–2 days", desc:"PC troubleshooting, component checks, and repair assistance."},
  {id:"os", name:"OS Installation", icon:"↻", price:599, time:"2–4 hours", desc:"Operating system installation and basic driver setup."},
  {id:"virus", name:"Virus Removal", icon:"⌁", price:299, time:"2–4 hours", desc:"Malware checks, cleanup, and basic security recommendations."},
  {id:"data", name:"Data Backup", icon:"▧", price:399, time:"2–6 hours", desc:"Help backing up important files to a suitable storage device."},
  {id:"network", name:"Wi-Fi & Network", icon:"⌁", price:249, time:"1–3 hours", desc:"Basic Wi-Fi, router, and connectivity troubleshooting."}
];
const STORAGE_KEY = "techcare_demo_bookings_v1";
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
let toastTimer;

function getBookings(){ try { const value=JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]"); return Array.isArray(value)?value:[]; } catch { return []; } }
function saveBookings(bookings){ localStorage.setItem(STORAGE_KEY,JSON.stringify(bookings)); }
function escapeHTML(value){ return String(value??"").replace(/[&<>"']/g, ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch])); }
function showToast(message){ const toast=$("#toast"); toast.textContent=message; toast.classList.add("show"); clearTimeout(toastTimer); toastTimer=setTimeout(()=>toast.classList.remove("show"),3200); }
function money(amount){ return "₹"+Number(amount).toLocaleString("en-IN"); }
function getService(id){ return SERVICES.find(service=>service.id===id); }
function statusClass(status){ return status.toLowerCase().replace(/\s+/g,"-"); }

function renderServices(){
  $("#serviceGrid").innerHTML=SERVICES.map(s=>`<article class="service-card"><div class="service-icon">${s.icon}</div><h3>${s.name}</h3><p>${s.desc}</p><div class="card-bottom"><span>From <strong>${money(s.price)}</strong></span><button type="button" data-book-service="${s.id}">Book now ↗</button></div></article>`).join("");
  $("#priceTable").innerHTML=SERVICES.map(s=>`<tr><td><strong>${s.name}</strong></td><td>${s.time}</td><td class="price-tag">${money(s.price)}+</td><td><button class="table-book" type="button" data-book-service="${s.id}">Book service</button></td></tr>`).join("");
  $("#bookingService").insertAdjacentHTML("beforeend",SERVICES.map(s=>`<option value="${s.id}">${s.name} — ${money(s.price)}+</option>`).join(""));
}
function updateEstimate(){const s=getService($("#bookingService").value);$("#bookingEstimate").textContent=s?money(s.price)+" onwards":"Select a service";}
function createBookingId(){return "TC-"+Math.random().toString(36).slice(2,8).toUpperCase();}
function formatDate(date){if(!date)return "Not specified";return new Date(date+"T00:00:00").toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});}
function statusPill(status){return `<span class="status-pill ${statusClass(status)}">${escapeHTML(status)}</span>`;}
function renderTrack(booking){
  $("#trackResult").innerHTML=`<div class="result-card"><div class="result-top"><div><small class="muted">BOOKING ID</small><div class="booking-code">${escapeHTML(booking.id)}</div></div>${statusPill(booking.status)}</div><div class="result-details"><div>Customer<br><strong>${escapeHTML(booking.name)}</strong></div><div>Service<br><strong>${escapeHTML(booking.serviceName)}</strong></div><div>Preferred date<br><strong>${escapeHTML(formatDate(booking.date))}</strong></div><div>Starting estimate<br><strong>${money(booking.price)}+</strong></div></div><p class="note">Demo tracker: status reflects what is saved in this browser.</p></div>`;
}
function renderAdmin(){
  const bookings=getBookings();
  $("#totalCount").textContent=bookings.length;
  $("#pendingCount").textContent=bookings.filter(b=>b.status==="Pending").length;
  $("#completedCount").textContent=bookings.filter(b=>b.status==="Completed").length;
  $("#adminRows").innerHTML=bookings.length?bookings.slice().reverse().map(b=>`<tr><td><strong>${escapeHTML(b.id)}</strong><br>${escapeHTML(b.name)}<br><small class="muted">${escapeHTML(b.phone)}</small></td><td>${escapeHTML(b.serviceName)}</td><td>${statusPill(b.status)}</td><td><select aria-label="Update status for ${escapeHTML(b.id)}" data-status-id="${escapeHTML(b.id)}">${["Pending","In Progress","Completed","Cancelled"].map(s=>`<option ${s===b.status?"selected":""}>${s}</option>`).join("")}</select></td></tr>`).join(""):`<tr><td colspan="4">No bookings yet. Submit a test booking to see it here.</td></tr>`;
}
function openAdmin(){ $("#adminModal").hidden=false; $("#adminLoginView").hidden=false; $("#adminDashboardView").hidden=true; $("#adminLoginForm").reset(); }
function closeAdmin(){ $("#adminModal").hidden=true; }
function chooseService(id){$("#bookingService").value=id;updateEstimate();$("#booking").scrollIntoView({behavior:"smooth"});}

renderServices();
$("#year").textContent=new Date().getFullYear();
const dateInput=$("#bookingDate");dateInput.min=new Date().toLocaleDateString("en-CA");
$("#bookingService").addEventListener("change",updateEstimate);
document.addEventListener("click",e=>{const target=e.target.closest("[data-book-service]");if(target)chooseService(target.dataset.bookService);});
$("#menuToggle").addEventListener("click",()=>{const nav=$("#mainNav");const open=nav.classList.toggle("open");$("#menuToggle").setAttribute("aria-expanded",String(open));});
$$('#mainNav a').forEach(a=>a.addEventListener("click",()=>{$("#mainNav").classList.remove("open");$("#menuToggle").setAttribute("aria-expanded","false");}));

$("#bookingForm").addEventListener("submit",e=>{
  e.preventDefault();
  const form=new FormData(e.currentTarget);
  const service=getService(form.get("service"));
  if(!service){showToast("Please choose a service.");return;}
  const phone=String(form.get("phone")||"").trim();
  if(!/^[0-9]{10}$/.test(phone)){showToast("Enter a valid 10-digit mobile number.");return;}
  const booking={id:createBookingId(),name:String(form.get("name")).trim(),phone,email:String(form.get("email")||"").trim(),device:form.get("device"),serviceId:service.id,serviceName:service.name,price:service.price,date:form.get("date"),time:form.get("time"),issue:String(form.get("issue")).trim(),status:"Pending",createdAt:new Date().toISOString()};
  const bookings=getBookings();bookings.push(booking);
  try{saveBookings(bookings);}catch{showToast("Could not save booking. Browser storage may be full or disabled.");return;}
  e.currentTarget.reset();updateEstimate();dateInput.min=new Date().toLocaleDateString("en-CA");
  $("#trackId").value=booking.id;renderTrack(booking);$("#trackResult").scrollIntoView({behavior:"smooth",block:"nearest"});
  showToast("Booking created! Your ID is "+booking.id);
});

$("#trackForm").addEventListener("submit",e=>{
  e.preventDefault();const id=$("#trackId").value.trim().toUpperCase();
  const booking=getBookings().find(b=>b.id.toUpperCase()===id);
  if(!booking){$("#trackResult").innerHTML='<div class="result-card">No booking found for that ID in this browser. Check the ID and try again.</div>';return;}
  renderTrack(booking);
});

$("#openAdmin").addEventListener("click",openAdmin);
$("#closeAdmin").addEventListener("click",closeAdmin);
$("#adminModal").addEventListener("click",e=>{if(e.target===$("#adminModal"))closeAdmin();});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeAdmin();});
$("#adminLoginForm").addEventListener("submit",e=>{
  e.preventDefault();const form=new FormData(e.currentTarget);
  // EDUCATIONAL DEMO ONLY: credentials are visible in client-side source and are not secure.
  if(form.get("username")==="admin"&&form.get("password")==="techcare123"){
    $("#adminLoginView").hidden=true;$("#adminDashboardView").hidden=false;renderAdmin();showToast("Demo admin login successful.");
  }else showToast("Incorrect demo username or password.");
});
$("#adminLogout").addEventListener("click",()=>{ $("#adminDashboardView").hidden=true;$("#adminLoginView").hidden=false;$("#adminLoginForm").reset();showToast("Logged out.");});
$("#adminRows").addEventListener("change",e=>{
  const id=e.target.dataset.statusId;if(!id)return;
  const bookings=getBookings();const booking=bookings.find(b=>b.id===id);if(!booking)return;
  booking.status=e.target.value;saveBookings(bookings);renderAdmin();showToast("Booking status updated.");
});

// Replace this with your real WhatsApp number including country code, digits only (example: 919876543210).
const WHATSAPP_NUMBER="917058521232";
const whatsappMessage=encodeURIComponent("Hello TECHCARE, I would like to enquire about computer service booking.");
$("#whatsappLink").href=`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;
$("#whatsappLink").addEventListener("click",e=>{if(WHATSAPP_NUMBER==="910000000000"){e.preventDefault();showToast("Please add your real WhatsApp number in script.js first.");}});
