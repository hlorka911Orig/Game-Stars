let money = 0
let xp = 0
let moves = 0
let gameOver = false
let cakeActive = false

const grid = document.getElementById("grid")
const moneyText = document.getElementById("money")
const xpText = document.getElementById("xp")
const movesText = document.getElementById("moves")
const shop = document.getElementById("shop")
const takeNowBtn = document.getElementById("takeNow")

let potionsCount = { row:0, bomb:0, cake:0, runner:0 }
let cells = []
let types = []

let goldenIndex = -1

function generateGrid(){

types=[]

let traps=10
let moneyCells=20
let x2=5
let halfAll=5
let halfMoney=5
let normal=100-traps-moneyCells-x2-halfAll-halfMoney

for(let i=0;i<traps;i++) types.push("trap")
for(let i=0;i<moneyCells;i++) types.push("money")
for(let i=0;i<x2;i++) types.push("x2")
for(let i=0;i<halfAll;i++) types.push("halfAll")
for(let i=0;i<halfMoney;i++) types.push("halfMoney")
for(let i=0;i<normal;i++) types.push("normal")

types.sort(()=>Math.random()-0.5)

/* золотая клетка шанс 1 к 300 */

if(Math.floor(Math.random()*300)===1){
goldenIndex=Math.floor(Math.random()*100)
}else{
goldenIndex=-1
}

}

function createGrid(){

grid.innerHTML=""
cells=[]

for(let i=0;i<100;i++){

let cell=document.createElement("div")
cell.className="cell"

let type=types[i]

cell.onclick=()=>{

if(gameOver) return
if(cell.classList.contains("opened")) return

moves++
movesText.innerText=moves

cell.classList.add("opened")

/* золотая клетка */

if(i===goldenIndex){

cell.innerText="⭐"

let r=Math.floor(Math.random()*3)

if(r===0){
money+=100
xp+=10
}

if(r===1){
money*=5
xp+=5
}

if(r===2){
xp*=2
money+=10
}

}

else if(type==="trap"){

if(cakeActive){
type="normal"
cakeActive=false
}

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

if(moves>=50) endGame()

}

grid.appendChild(cell)

cells.push({
element:cell,
type:type
})

}

}

function endGame(){

gameOver=true

cells.forEach((c,i)=>{

if(!c.element.classList.contains("opened")){

c.element.classList.add("lost")

if(i===goldenIndex) c.element.innerText="⭐"
else if(c.type==="trap") c.element.innerText="❌"
else if(c.type==="money") c.element.innerText="💰"
else if(c.type==="x2") c.element.innerText="✖️2"
else if(c.type==="halfAll") c.element.innerText="⚠️"
else if(c.type==="halfMoney") c.element.innerText="💸"
else if(c.type==="normal") c.element.innerText="⭐"

}

})

openShop()

}

function openShop(){

shop.style.display="block"

shop.innerHTML=`

<h2>🛒 Магазин</h2>

<h3>Конвертация</h3>

<button onclick="xpToMoney()">1 XP → 5 денег</button>
<button onclick="moneyToXp()">5 денег → 1 XP</button>

<h3>Купить зелья</h3>

<button onclick="buyPotion('row')">Зелье ряд (5)</button>
<button onclick="buyPotion('bomb')">Царь-бомба (10)</button>
<button onclick="buyPotion('cake')">Тортик (7)</button>
<button onclick="buyPotion('runner')">Бегун (8)</button>

<br><br>

<button onclick="ready()">Я готов</button>

`

}

function ready(){

shop.style.display="none"

moves=0
movesText.innerText=0

gameOver=false
cakeActive=false

generateGrid()
createGrid()

}

takeNowBtn.onclick=()=>{

if(gameOver) return

endGame()

}

function xpToMoney(){

if(xp>=1){

xp--
money+=5
updateStats()

}

}

function moneyToXp(){

if(money>=5){

money-=5
xp++
updateStats()

}

}

function buyPotion(type){

if(type==="row" && money>=5){
money-=5
potionsCount.row++
}

if(type==="bomb" && money>=10){
money-=10
potionsCount.bomb++
}

if(type==="cake" && money>=7){
money-=7
potionsCount.cake++
}

if(type==="runner" && money>=8){
money-=8
potionsCount.runner++
}

updateStats()
updatePotionDisplay()

}

function updateStats(){

moneyText.innerText=money
xpText.innerText=xp

}

function updatePotionDisplay(){

let select=document.getElementById("potionSelect")

select.options[0].text=`Зелье ряд (${potionsCount.row})`
select.options[1].text=`Царь-бомба (${potionsCount.bomb})`
select.options[2].text=`Тортик (${potionsCount.cake})`
select.options[3].text=`Бегун (${potionsCount.runner})`

}

document.getElementById("usePotion").onclick=()=>{

let potion=document.getElementById("potionSelect").value

if(potionsCount[potion]<=0){
alert("Нет этого зелья")
return
}

potionsCount[potion]--

updatePotionDisplay()

if(potion==="row"){

let row=Math.floor(Math.random()*10)

cells.forEach((c,i)=>{

if(Math.floor(i/10)===row){
c.element.click()
}

})

}

else if(potion==="bomb"){

for(let i=0;i<30;i++){

let r=Math.floor(Math.random()*cells.length)
cells[r].element.click()

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

generateGrid()
createGrid()
updatePotionDisplay()
