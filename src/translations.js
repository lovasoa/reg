const translations = {
    fr: {
        "Play against an AI": "Jouer contre une IA",
        'Play online with a friend': "Jouer en ligne contre un ami",
        'Play offline': "Jouer hors ligne",
        'rÊg is an open source puzzle game.': "rÊg est un jeu de réflexion libre.",
        'More info': "En savoir plus",
        'Rules': "Règles du jeu",
        "Your turn ! Place a number somewhere in the grid.": "À vous de jouer ! Placez un nombre sur la grille.",
        "Play": "Jouer",
        'Waiting for your opponent to play...': "En attente du mouvement de votre adversaire...",
        'Numbers in a {} must be either increasing or decreasing': "Sur chaque {}, les nombres doivent être ordonnés",
        'line': 'ligne',
        'column': 'colonne',
        'diagonal': 'diagonale',
        'No number can appear more than once': "Chaque nombre ne peut apparaître quʼune seule fois",
        "All numbers must be between 1 and {}": "Tous les nombres doivent être compris entre 1 et {}",
        "Values you can play here: {}.": "Valeurs que vous pouvez jouer ici: {}.",
        "You can't play here": "Impossible de jouer ici",
    }
}

/**
 * Translate a string in the local language of the user
 * @param {TemplateStringsArray|String} source 
 */
export default function t(source) {
    if (typeof source === "object") {
        const [base, ...args] = [...arguments];
        return t(base.join('{}'))
            .split('{}')
            .map((s, i) => args[i] ? s + t(args[i]) : s)
            .join('');
    }
    source = source.toString();
    const lang = window.navigator.language.slice(0, 2);
    return translations[lang] && translations[lang][source] || source;
}
