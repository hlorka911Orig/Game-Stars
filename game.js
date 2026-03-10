let money = 0
let xp = 0
let moves = 0
let gameOver = false
let cakeActive = false

const grid = document.getElementById("grid")
const moneyText = document.getElementById("money")
const xpText = document.getElementById("xp")
const movesText = document.getElementById("moves")

// магазин
const shop = document.createElement("div")
shop.style.display="none"
shop.style.marginTop="20px"
shop.innerHTML=`
<h2>Магазин</h2>
<button id="xpToMoney">1 XP → 5 Деньги</button>
<button id="moneyToXp">5 Денег → 1 XP</button>
<br><br>
<h3>Купить зелья:</h3>
<button id="buyRow">Зелье ряд (5 Денег)</button>
<button id="buyBomb">Царь-бомба (10 Денег)</button>
<button id="buyCake">Тортик (7 Денег)</button>
<button id="buyRunner">Бегун (8 Денег)</button>
<br><br>
<button id="ready">Я готов</button>
`
document.body.appendChild(shop)

// счетчик зелий
let potionsCount = { row:0, bomb:0, cake:0, runner:0 }

let cells=[]
let types=[]

// Генерация типов клеток с учетом XP
function generateGrid(){
  types=[]

  let luckFactor = Math.floor(xp / 10) // каждые 10 XP уменьшают ловушки
  let trapsCount = Math.max(10 - luckFactor, 2) // минимум 2 ловушки
  let moneyCount = 20
  let x2Count = 5
  let halfAllCount = 5
  let halfMoneyCount = 5
  let normalCount = 100 - trapsCount - moneyCount - x2Count - halfAllCount - halfMoneyCount

  // ❌ ловушки
  for(let i=0;i<trapsCount;i++) types.push("trap")
  // 💰 деньги
  for(let i=0;i<moneyCount;i++) types.push("money")
  // ✖️2
  for(let i=0;i<x2Count;i++) types.push("x2")
  // ⚠️ делят деньги и опыт на 2
  for(let i=0;i<halfAllCount;i++) types.push("halfAll")
  // 💸 делят деньги на 2
  for(let i=0;i<halfMoneyCount;i++) types.push("halfMoney")
  // ⭐ обычные
  for(let i=0;i<normalCount;i++) types.push("normal")

  // случайное перемешивание
  types.sort(()=>Math.random()-0.5)
}

generateGrid()

function playClick(){
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.connect(gain)
  gain.connect(audioCtx.destination)
  osc.frequency.value = 700
  osc.type="sine"
  gain.gain.value = 0.03
  osc.start()
  osc.stop(audioCtx.currentTime + 0.04)
}

function openCell(c){
  if(c.element.classList.contains("opened")) return
  c.element.click()
}

function createGrid(){
  grid.innerHTML=""  // очищаем старое поле
  cells=[]

  for(let i=0;i<100;i++){
    let cell=document.createElement("div")
    cell.className="cell"
    let type=types[i]

    cell.onclick=()=>{
      if(gameOver) return
      if(cell.classList.contains("opened")) return

      playClick()
      moves++
      movesText.innerText=moves
      cell.classList.add("opened")

      // Обработка типов клеток
      if(type==="trap"){
        if(cakeActive){ type="normal"; cakeActive=false }
        money--
        xp--
        cell.innerText="❌"
      }
      else if(type==="money"){
        money++
        cell.innerText="💰"
      }
      else if(type==="x2"){
        money*=2
        xp++
        cell.innerText="✖️2"
      }
      else if(type==="halfAll"){
        money=Math.floor(money/2)
        xp=Math.floor(xp/2)
        cell.innerText="⚠️"
      }
      else if(type==="halfMoney"){
        money=Math.floor(money/2)
        cell.innerText="💸"
      }
      else{
        money++
        xp++
        cell.innerText="⭐"
      }

      moneyText.innerText=money
      xpText.innerText=xp

      if(moves>=50){ endGame() }
    }

    grid.appendChild(cell)
    cells.push({element:cell,type:type})
  }
}

createGrid()

function endGame(){
  gameOver=true
  setTimeout(()=>{
    cells.forEach(c=>{
      if(!c.element.classList.contains("opened")){
        c.element.classList.add("lost")
        if(c.type==="trap") c.element.innerText="❌"
        if(c.type==="money") c.element.innerText="💰"
        if(c.type==="x2") c.element.innerText="✖️2"
        if(c.type==="halfAll") c.element.innerText="⚠️"
        if(c.type==="halfMoney") c.element.innerText="💸"
        if(c.type==="normal") c.element.innerText="⭐"
      }
    })
    openShop()
  },10000)
}

function openShop(){
  shop.style.display="block"

  document.getElementById("xpToMoney").onclick=()=>{
    if(xp>=1){ xp-=1; money+=5; updateStats() }
  }
  document.getElementById("moneyToXp").onclick=()=>{
    if(money>=5){ money-=5; xp+=1; updateStats() }
  }

  document.getElementById("buyRow").onclick = ()=>{
    if(money>=5){ money-=5; potionsCount.row++; updateStats(); updatePotionDisplay(); }
  }
  document.getElementById("buyBomb").onclick = ()=>{
    if(money>=10){ money-=10; potionsCount.bomb++; updateStats(); updatePotionDisplay(); }
  }
  document.getElementById("buyCake").onclick = ()=>{
    if(money>=7){ money-=7; potionsCount.cake++; updateStats(); updatePotionDisplay(); }
  }
  document.getElementById("buyRunner").onclick = ()=>{
    if(money>=8){ money-=8; potionsCount.runner++; updateStats(); updatePotionDisplay(); }
  }

  document.getElementById("ready").onclick = ()=>{
    moves=0
    movesText.innerText=moves
    gameOver=false
    cakeActive=false
    generateGrid()
    createGrid()
  }
}

function updateStats(){
  moneyText.innerText=money
  xpText.innerText=xp
}

function updatePotionDisplay(){
  let select = document.getElementById("potionSelect")
  select.options[0].text = `Зелье ряд (${potionsCount.row})`
  select.options[1].text = `Царь-бомба (${potionsCount.bomb})`
  select.options[2].text = `Тортик (${potionsCount.cake})`
  select.options[3].text = `Бегун (${potionsCount.runner})`
}

// зелья
document.getElementById("usePotion").onclick = ()=>{
  let potion = document.getElementById("potionSelect").value
  if(potionsCount[potion]<=0){
    alert("У тебя нет этого зелья!")
    return
  }

  potionsCount[potion]--
  updatePotionDisplay()

  if(potion==="row"){
    let row = Math.floor(Math.random()*10)
    cells.forEach((c,i)=>{ if(Math.floor(i/10)===row) openCell(c) })
  }
  else if(potion==="bomb"){
    for(let i=0;i<30;i++){
      let r = Math.floor(Math.random()*cells.length)
      openCell(cells[r])
    }
  }
  else if(potion==="cake"){
    cakeActive=true
  }
  else if(potion==="runner"){
    cells.forEach(c=>{
      if(c.type==="trap") c.type="normal"
      else if(c.type==="normal") c.type="trap"
    })
  }
}
