import clsx from "clsx";
import { useEffect, useState } from "react";
import { scaleDown as Menu } from "react-burger-menu";

import { levelFour, levelOne, levelThree, levelTwo } from "./assets/levels";
import Card from "./components/card/Card";
import { bigCardStyles } from "./components/card/Card.css";
import Credits from "./components/credits/Credits";
import CardHistory from "./components/history/CardHistory";
import logo from "./assets/techlifegame.png";

import {
  appStyles,
  levelButtonStyles,
  levelsStyles,
  nextCardButtonStlyes,
  questionStyles,
  selectedLevelStyles,
  titleStyles,
  textInputStyles,
  smallButtonStyles
} from "./styles/app.css";

function shuffle<T>(array: T[]) {
  let currentIndex = array.length;
  let temporaryValue;
  let randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

const styles = {
  bmBurgerButton: {
    position: 'fixed',
    width: '3%',
    height: '3%',
    right: 10,
    top: 15,
  },
  bmBurgerBars: {
    background: '#40916b',
  },
  bmMenu: {
    background: 'white',
    padding: '10%',
    overflow: 'hidden'
  },
  bmMenuWrap: {
    position: 'fixed',
    height: '100%'
  },
  bmCross: {
    background: '#bdc3c7'
  },
  'page-wrap': {
    width: '100%',
    height: '100%',
    display: 'flex',
    'justify-content': 'center',
    'align-items': 'center',
    padding: 0,
  },
  bmOverlay: {
    background: 'rgba(0, 0, 0, 0.3)'
  }
};

function App() {
  const levels = {
    levelOne: shuffle(levelOne),
    levelTwo: shuffle(levelTwo),
    levelThree: shuffle(levelThree),
    levelFour: shuffle(levelFour)
  };

  const levelKeyToInt = {
    levelOne: 1,
    levelTwo: 2,
    levelThree: 3,
    levelFour: 4
  };

  const IntToLevelKey = {
    1: "levelOne",
    2: "levelTwo",
    3: "levelThree",
    4: "levelFour"
  };

  const [gameState, setGameState] = useState(levels);

  const [currLevel, setCurrLevel] = useState(Object.keys(levels)[0] as keyof typeof levels);
  const [currRound, setCurrRound] = useState(1);
  const [currCard, setCurrCard] = useState(levels[currLevel][0]);
  const [cardHistory, setCardHistory] = useState<string[]>([]);

  const [players, setPlayers] = useState<string[]>([]);
  const [rounds, setRounds] = useState(1);
  const [newPlayer, setNewPlayer] = useState("");
  const [playersThisRound, setPlayersThisRound] = useState<string[]>([]);
  const [roundStarted, setRoundStarted] = useState(false);

  const [contentTagsOn, setContentTagsOn] = useState(true);

  if (players.length > 0 && playersThisRound.length != players.length && !roundStarted) {
    setPlayersThisRound(shuffle(players));
  }

  type levelKey = keyof typeof levels;

  function handleChangeLevel(newLevel: levelKey) {
    setCurrLevel(newLevel);
    if (gameState[newLevel].length === 1) {
      const finalMessage = "You have finished this level!";
      setCurrCard(finalMessage);
    } else {
      setCurrCard(gameState[newLevel][0]);
    }
  }

  const buttons = (Object.keys(levels) as levelKey[]).map((level) => (
    <button
      className={clsx(levelButtonStyles, { [selectedLevelStyles]: level === currLevel })}
      onClick={() => {handleChangeLevel(level); setCurrRound(1)}}
      key={level}
    >
      {level.split(/(?=[A-Z])/).join(" ")}
    </button>
  ));

  function handleNextCard(skip=false) {
    const finalMessage = "You have finished this level!";
    if (gameState[currLevel].length === 1) {
      if (currCard === finalMessage) {
        return;
      } else {
        const tempHistory = [currCard, ...cardHistory];
        setCardHistory(tempHistory);
        setCurrCard(finalMessage);
      }
    } else {
      if (!skip) {
        const tempHistory = [currCard, ...cardHistory];
        setCardHistory(tempHistory);
      }

      let tempGameStateLevel = gameState[currLevel].slice(1);
      setGameState({...gameState, [currLevel]: tempGameStateLevel});
      setCurrCard(gameState[currLevel][0]);
    }

    if (!skip) {
      let p1 = playersThisRound[0]; 
      let p2 = playersThisRound[1];
      let p3 = null;
  
      let updatedPlayersThisRound = [];
  
      if (players.length % 2 == 1) {
        p3 = playersThisRound[2];
        updatedPlayersThisRound = playersThisRound.filter((v) => v !== p1 && v !== p2 && v !== p3);
      }
      else {
        updatedPlayersThisRound = playersThisRound.filter((v) => v !== p1 && v !== p2);
      }
      setPlayersThisRound(updatedPlayersThisRound);
  
      if (updatedPlayersThisRound.length > 0) {
        setRoundStarted(true);
      }
      else {
        setRoundStarted(false);
        setCurrRound(currRound + 1);
        if (currRound+1 > rounds) {
          handleChangeLevel(IntToLevelKey[levelKeyToInt[currLevel]+1]);
          setCurrRound(1);
        }
      }
    }
  }

  const handleAddPlayer = () => {
    if (newPlayer.length > 0) {
      setPlayers(current => [...current, newPlayer]);
      setNewPlayer('');
    }
  };

  const handleRemovePlayer = (e) => {
    console.log(e.currentTarget.value);
    let toFilter = e.currentTarget.value;
    setPlayers(current => current.filter((v) => v !== toFilter));
  }

  const toggleContentTags = () => {
    setContentTagsOn(!contentTagsOn);
  };

  let renderedNames = players.map(player => <div>{player} &nbsp; <button value={player} onClick={handleRemovePlayer} className={clsx(smallButtonStyles)}>Remove</button></div>);

  return (
    <div id="outer-container" style={{height: '100%'}}>
      <Menu id='scaleDown' styles={styles} width={500} pageWrapId={ "page-wrap" } outerContainerId={ "outer-container" } right>
        <div align="left">
          <h2>Player Config</h2>
          <p><b>{players.length == 1 ? players.length + " player is " : players.length + " players are "}</b> playing with {rounds == 1 ? rounds + " card " : rounds + " cards "}for each player each round, making a total of {players.length * rounds} cards each level.</p>
          <ul><h3>{renderedNames}</h3></ul>
          <input 
            value={newPlayer} 
            onChange={(e) => setNewPlayer(e.target.value)} 
            onKeyDown={(e) => { if (e.key === "Enter") handleAddPlayer() }} 
            className={clsx(textInputStyles)} />
          <br />
          <button onClick={handleAddPlayer} className={clsx(smallButtonStyles)}>Add player</button>
          <p>
            <input
              value={rounds}
              type="number"
              min="1"
              onChange={(e) => setRounds(parseInt(e.currentTarget.value))}
              className={clsx(textInputStyles)} />
            <br/>
            cards each player answers
          </p>
          <p><input type="checkbox" onClick={toggleContentTags} defaultChecked/> Play with content tags</p>
        </div>
      </Menu>
      <main id="page-wrap">
        <div className={titleStyles} align="center"><img src={logo} height={200}/><br/><b>so how's your tech life</b></div>
        <div className={appStyles}>
          <div>{buttons}</div>
          <div className={questionStyles}>
            <Card key={currCard} styleName={bigCardStyles} question={currCard} contentTagsOn={contentTagsOn}/>
          </div>
          <CardHistory cardHistory={cardHistory} />

          <div align="center">
              <button className={nextCardButtonStlyes} onClick={() => handleNextCard()}>
                next card
              </button>
              <button className={nextCardButtonStlyes} onClick={() => handleNextCard(true)}>
                skip card
              </button>

            <div>
              <h3>Level {levelKeyToInt[currLevel]}, Round {currRound}</h3>
              <h3>Turn: {playersThisRound.length % 2 == 0 ? playersThisRound[0] + " and " + playersThisRound[1] : playersThisRound[0] + ", " + playersThisRound[1] + " and " + playersThisRound[2]}</h3>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
