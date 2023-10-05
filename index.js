const values = [
    'A',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    'J',
    'Q',
    'K'
]
const suits = ['♠', '♥', '♣', '♦']

let allDecks = []
let dealerHand = []
let playerHand = []

const cardModel = document.createElement('div')
cardModel.classList.add('card')

const dealer = document.getElementById('dealer')
const player = document.getElementById('player')
const hit = document.getElementById('hit-button')
const pass = document.getElementById('pass-button')
const buttonContainer = document.getElementById('button-container')
const textBox = document.getElementById('text-box')
const nextHand = document.getElementById('next-hand-button')
const footer = document.getElementById('footer')

// Create 1 deck. 52 cards, 13 each
const createDeck = () => {
    const deck = []
    suits.forEach((suit) => {
        values.forEach((value) => {
            const card = suit + value
            deck.push(card)
        })
    })
    return deck
}

// Create x amount of decks and put in one array
const shuffleDecks = (num) => {
    for (let i = 0; i < num; i++) {
        const newDeck = createDeck()
        allDecks = [...allDecks, ...newDeck]
    }
}

// Select random card
const selectRandomCard = () => {
    const randomIndex = Math.floor(Math.random() * allDecks.length)
    const card = allDecks[randomIndex]
    // Remove the card from the decks.
    allDecks.splice(randomIndex, 1)
    return card
}

// Deal hands to dealer and player. 2 cards
const dealHands = () => {
    dealerHand = [selectRandomCard(), selectRandomCard()]
    dealerHand.forEach((card, index) => {
        const newCard = cardModel.cloneNode(true) // ????
        // Hide one of dealers cards.
        index === 0 ? newCard.classList.add('back') : (newCard.innerHTML = card)

        // Makes ♦ and ♥ cards red
        if (card[0] === '♦' || card[0] === '♥') {
            newCard.classList.add('red')
        }
        dealer.append(newCard)
    })
    playerHand = [selectRandomCard(), selectRandomCard()]
    playerHand.forEach((card) => {
        const newCard = cardModel.cloneNode(true) // ???

        newCard.innerHTML = card
        if (card[0] === '♦' || card[0] === '♥') {
            newCard.classList.add('red')
        }
        player.append(newCard)
    })
}

//  Calc the value of the hand (argument)
const calcValue = (hand) => {
    let value = 0
    let hasAce = 0
    hand.forEach((card) => {
        // Card.length === 2 = !10
        if (card.length === 2) {
            if (card[1] === 'A') {
                hasAce++
                // K, Q, J = 10 points
            } else if (card[1] === 'K' || card[1] === 'Q' || card[1] === 'J') {
                value += 10
                // The value of the card
            } else {
                value += parseInt(card[1])
            }
            // else is card.length === 3 = 10
        } else {
            value += 10
        }
    })

    // Ace = 1 if the value + 11 = > 21
    if (hasAce > 0) {
        for (let i = 1; i <= hasAce; i++) {
            if (value + 11 > 21) {
                value += 1
            }
            // And 11 if value + 11 = < 21
            else {
                value += 11
            }
        }
    }
    return value
}

// Textbox that show when someone wins or lose.
const showTextBox = (text) => {
    textBox.children[0].children[0].innerHTML = text
    textBox.style.display = 'flex' // Make it visible
    buttonContainer.style.display = 'none' // Make buttons not visible
}

// Decide the winner, calc both hands
const decideWinner = async () => {
    let dealerValue = await calcValue(dealerHand)
    let playerValue = await calcValue(playerHand)
    let text
    if (playerValue === dealerValue) {
        text = `Tie! Both had: ${playerValue} points.`
    } else if (playerValue > dealerValue) {
        text = `You Won! You had: ${playerValue} points and Dealer had: ${dealerValue}`
    } else {
        text = `You lost.. You had: ${playerValue} points and Dealer had: ${dealerValue} points.`
    }
    showTextBox(text)
}

// When hit button is pressed
const hitPlayer = () => {
    // Get one more random card
    const newCard = selectRandomCard()
    playerHand.push(newCard)
    const newCardNode = cardModel.cloneNode(true)
    newCardNode.innerHTML = newCard
    player.append(newCardNode)
    // Calc the new value and show text box if its > 21
    const handValue = calcValue(playerHand)
    if (handValue > 21) {
        showTextBox(`You got: ${handValue}.. Dealer wins`)
    } /* else if (handValue === 21) {
        showTextBox(`BlackJack!!! You won!`)
    } */ // This shows up before button is pressed.

    updateFooterPosition() // Check if footer have to be moved
}

// When pass button is pressed
const hitDealer = () => {
    // First check if user gotm blackjack
    let userHandValue = calcValue(playerHand)
    if (userHandValue === 21) {
        showTextBox('BlackJack!!! You won!!!')
        return
    }

    // Reveal black card
    const hiddenCard = dealer.children[0]
    hiddenCard.classList.remove('back')
    hiddenCard.innerHTML = dealerHand[0]
    //Calc hand value of dealer
    let handValue = calcValue(dealerHand)
    // if hand < 16 --> add one more card
    if (handValue < 16) {
        let newCard = selectRandomCard()
        dealerHand.push(newCard)
        const newCardNode = cardModel.cloneNode(true)
        newCardNode.innerHTML = newCard
        dealer.append(newCardNode)
        handValue = calcValue(dealerHand)
    }

    // Check new value
    // less than 16 --> Get one more random card
    if (handValue < 16) {
        hitDealer()
        // Blackjack
    } else if (handValue === 21) {
        showTextBox('BlackJack!!! Dealer wins')
    } else if (handValue > 21) {
        showTextBox(`Dealer got: ${handValue}.. You Won!`)
    } else {
        // decide winner
        decideWinner()
    }
}

// Clear hand when game is over
const clearHands = () => {
    while (dealer.children.length > 0) {
        dealer.children[0].remove()
    }
    while (player.children.length > 0) {
        player.children[0].remove()
    }
    return true
}

// Start the game with 4 * 52 cards (208)
const play = () => {
    // if its less then 10 cards shuffle 4 decks
    if (allDecks.length < 10) shuffleDecks(4)
    clearHands()
    dealHands()

    textBox.style.display = 'none'
    buttonContainer.style.display = 'block'
}

// Fix footer position
function updateFooterPosition() {
    const pageHeight = document.documentElement.scrollHeight
    const windowHeight = window.innerHeight

    if (pageHeight > windowHeight) {
        footer.style.position = 'relative'
    } else {
        footer.style.position = 'absolute'
        footer.style.bottom = '0'
    }
}

hit.addEventListener('click', hitPlayer)
pass.addEventListener('click', hitDealer)
nextHand.addEventListener('click', play)

shuffleDecks(4)
play()
