// Variables du jeu
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let gameStarted = false;
let timer = 0;
let timerInterval = null;
let totalPairs = 8; // 8 paires = 16 cartes
let canFlip = true;

// Éléments DOM
const memoryBoard = document.getElementById('memory-board');
const movesElement = document.getElementById('moves');
const pairsElement = document.getElementById('pairs');
const timerElement = document.getElementById('timer');
const restartButton = document.getElementById('restart');
const hintButton = document.getElementById('hint');
const themeToggle = document.getElementById('theme-toggle');
const messageElement = document.getElementById('message');

// Thème des images de la Saint-Valentin
// REMPLACEZ CES CHEMINS PAR VOS FICHIERS .png
const cardImages = [
    '1.png', '2.png', '3.png', '4.png',
    '5.png', '6.png', '7.png', '8.png', '9.png'
];

// Dos de carte (remplacez par votre fichier)
const cardBackImage = 'dos.png';

// Initialisation du jeu
function initGame() {
    // Réinitialiser les variables
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    gameStarted = false;
    timer = 0;
    canFlip = true;
    
    // Arrêter le timer s'il est en cours
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // Mettre à jour l'affichage
    movesElement.textContent = moves;
    pairsElement.textContent = `${matchedPairs} / ${totalPairs}`;
    timerElement.textContent = '00:00';
    
    // Cacher le message
    hideMessage();
    
    // Créer les cartes
    createCards();
    
    // Mélanger et afficher les cartes
    shuffleCards();
    renderCards();
}

// Créer les cartes (doubler chaque image pour former des paires)
function createCards() {
    // Dupliquer les images pour créer des paires
    let cardPairs = [];
    for (let i = 0; i < totalPairs; i++) {
        const imageIndex = i % cardImages.length;
        cardPairs.push({
            id: i,
            image: cardImages[imageIndex]
        });
        cardPairs.push({
            id: i,
            image: cardImages[imageIndex]
        });
    }
    
    // Créer les objets cartes
    cards = cardPairs.map((pair, index) => ({
        id: pair.id,
        image: pair.image,
        isFlipped: false,
        isMatched: false,
        element: null
    }));
}

// Mélanger les cartes
function shuffleCards() {
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
}

// Afficher les cartes sur le plateau
function renderCards() {
    memoryBoard.innerHTML = '';
    
    cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.dataset.index = index;
        
        // Face avant (image)
        const frontElement = document.createElement('div');
        frontElement.className = 'card-front';
        const imgElement = document.createElement('img');
        // Utilisez votre propre chemin d'images
        imgElement.src = `images/${card.image}`;
        imgElement.alt = `Carte Saint-Valentin ${card.id + 1}`;
        imgElement.onerror = function() {
            // Si l'image n'existe pas, afficher un emoji à la place
            this.style.display = 'none';
            const emoji = document.createElement('div');
            emoji.style.fontSize = '3rem';
            emoji.textContent = getEmojiForCard(card.id);
            frontElement.appendChild(emoji);
        };
        frontElement.appendChild(imgElement);
        
        // Face arrière (dos)
        const backElement = document.createElement('div');
        backElement.className = 'card-back';
        const backImg = document.createElement('img');
        backImg.src = `images/${cardBackImage}`;
        backImg.alt = 'Dos de carte';
        backImg.onerror = function() {
            // Si l'image du dos n'existe pas, utiliser un emoji
            this.style.display = 'none';
            const heart = document.createElement('div');
            heart.innerHTML = '<i class="fas fa-heart"></i>';
            backElement.appendChild(heart);
        };
        backElement.appendChild(backImg);
        
        cardElement.appendChild(frontElement);
        cardElement.appendChild(backElement);
        
        // Ajouter l'événement de clic
        cardElement.addEventListener('click', () => flipCard(index));
        
        // Sauvegarder la référence à l'élément
        card.element = cardElement;
        memoryBoard.appendChild(cardElement);
    });
}

// Obtenir un emoji pour une carte (en cas d'images manquantes)
function getEmojiForCard(id) {
    const emojis = ['❤️', '🌹', '🏹', '🎁', '🍫', '💌', '💍', '🕯️'];
    return emojis[id % emojis.length];
}

// Retourner une carte
function flipCard(index) {
    const card = cards[index];
    
    // Vérifier si on peut retourner la carte
    if (!canFlip || card.isFlipped || card.isMatched || flippedCards.length >= 2) {
        return;
    }
    
    // Démarrer le timer au premier clic
    if (!gameStarted) {
        startTimer();
        gameStarted = true;
    }
    
    // Retourner la carte
    card.isFlipped = true;
    card.element.classList.add('flipped');
    flippedCards.push({ index, card });
    
    // Si deux cartes sont retournées, vérifier si elles correspondent
    if (flippedCards.length === 2) {
        canFlip = false;
        moves++;
        movesElement.textContent = moves;
        
        // Vérifier la paire après un court délai
        setTimeout(checkMatch, 800);
    }
}

// Vérifier si les deux cartes retournées correspondent
function checkMatch() {
    const [first, second] = flippedCards;
    
    if (first.card.id === second.card.id) {
        // Correspondance trouvée
        first.card.isMatched = true;
        second.card.isMatched = true;
        matchedPairs++;
        pairsElement.textContent = `${matchedPairs} / ${totalPairs}`;
        
        // Animation de correspondance
        first.card.element.classList.add('matched');
        second.card.element.classList.add('matched');
        
        // Vérifier si le jeu est terminé
        if (matchedPairs === totalPairs) {
            endGame();
        }
    } else {
        // Pas de correspondance, retourner les cartes
        first.card.isFlipped = false;
        second.card.isFlipped = false;
        
        setTimeout(() => {
            first.card.element.classList.remove('flipped');
            second.card.element.classList.remove('flipped');
        }, 500);
    }
    
    // Réinitialiser les cartes retournées
    flippedCards = [];
    canFlip = true;
}

// Démarrer le timer
function startTimer() {
    timer = 0;
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        timer++;
        updateTimerDisplay();
    }, 1000);
}

// Mettre à jour l'affichage du timer
function updateTimerDisplay() {
    const minutes = Math.floor(timer / 60).toString().padStart(2, '0');
    const seconds = (timer % 60).toString().padStart(2, '0');
    timerElement.textContent = `${minutes}:${seconds}`;
}

// Terminer le jeu
function endGame() {
    clearInterval(timerInterval);
    
    // Calculer le score
    const score = Math.max(1000 - (moves * 10) - (timer * 2), 100);
    
    showRomanticMessage(timer, moves);

    // Afficher le message de victoire
    showMessage(`Félicitations ! Vous avez gagné en ${moves} coups et ${timer} secondes. Score : ${score}`, 'win');
    
    // Animation de victoire
    memoryBoard.classList.add('win-animation');
    setTimeout(() => {
        memoryBoard.classList.remove('win-animation');
    }, 1500);
}

function showRomanticMessage(time, moves) {
    // Créer une popup personnalisée
    const popup = document.createElement('div');
    popup.className = 'romantic-popup';
    
    let message = '';
    let emoji = '';
    
    const temps_gagnant = 30; // Temps en secondes pour les messages d'amour
    if (time < temps_gagnant) {
        // Message pour les champions ❤️
        const loveMessages = [
            "BRAVO CHACHA D'AMOUR ! ❤️",
            "T’ES LA MEILLEURE ET LA PLUS BELLE ! 🌹", 
            'TROP FORTE MON COEUR ! ⚡',
            'AMOUR ET TAMTAM AMOUREUX ! ✨',
            'LAPINOu FAIT DES BISOUS ! 💋'
        ];
        message = loveMessages[Math.floor(Math.random() * loveMessages.length)];
        emoji = '🏆❤️';
        popup.classList.add('super-win');
    } else {
        // Message pour encourager
        const tryMessages = [
            'ESSAIE ENCORE POUR MOI ! 💪',
            'PRESQUE ! ENCORE UN EFFORT ! 🌹',
            'TU PEUX FAIRE MIEUX MON BB ! ⏱️',
            'POUR UN BISOUS, FAIS MOINS DE 30s ! 😘',
            'JE CROIS EN TOI ! ⭐',
            'PRESQUE PARFAIT ! 🌟',
            'ENCORE UN ESSAI ? 💝'
        ];
        message = tryMessages[Math.floor(Math.random() * tryMessages.length)];
        emoji = '⏰💪';
        popup.classList.add('try-again');
    }
    
    // Ajouter le temps et les coups
    const minutes = Math.floor(timer / 60).toString().padStart(2, '0');
    const seconds = (timer % 60).toString().padStart(2, '0');
    
    popup.innerHTML = `
        <div class="popup-content">
            <div class="popup-emoji">${emoji}</div>
            <h2 class="popup-title">${message}</h2>
            <div class="popup-stats">
                <p>⏱️ Temps : ${minutes}:${seconds}</p>
                <p>🎯 Coups : ${moves}</p>
            </div>
            <button class="popup-btn" onclick="this.closest('.romantic-popup').remove(); initGame();">
                Rejouer <i class="fas fa-heart"></i>
            </button>
        </div>
    `;
    
    // Ajouter la popup au body
    document.body.appendChild(popup);
    
    // Fermer la popup après 5 secondes pour "essaye encore", garder plus longtemps pour les victoires
    if (time >= temps_gagnant) {
        setTimeout(() => {
            if (popup.parentNode) {
                popup.remove();
            }
        }, 10000);
    } else {
        addConfetti();
        // Pour les victoires, on laisse la popup jusqu'à ce qu'on clique
        setTimeout(() => {
            if (popup.parentNode) {
                popup.classList.add('fade-out');
                setTimeout(() => popup.remove(), 500);
            }
        }, 6000);
    }
}

// Fonction pour ajouter des confettis (optionnel)
function addConfetti() {
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 5000);
    }
}



// Afficher un message
function showMessage(text, type = '') {
    messageElement.textContent = text;
    messageElement.className = `message ${type} show`;
    
    // Cacher le message après 5 secondes
    setTimeout(hideMessage, 5000);
}

// Cacher le message
function hideMessage() {
    messageElement.classList.remove('show');
}

// Fonction d'indice

// Basculer entre thème clair et sombre
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    
    // Mettre à jour l'icône du bouton
    const icon = themeToggle.querySelector('i');
    if (document.body.classList.contains('dark-theme')) {
        icon.className = 'fas fa-sun';
        themeToggle.innerHTML = '<i class="fas fa-sun"></i> Thème';
    } else {
        icon.className = 'fas fa-moon';
        themeToggle.innerHTML = '<i class="fas fa-moon"></i> Thème';
    }
}

// Événements
restartButton.addEventListener('click', initGame);
themeToggle.addEventListener('click', toggleTheme);

// Initialiser le jeu au chargement
document.addEventListener('DOMContentLoaded', initGame);