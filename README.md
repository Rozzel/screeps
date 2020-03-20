
![Screeps](https://screeps.com/images/logotype-animated.svg "Screeps")
Screeps
===

- [Screeps](#screeps)
  - [Creeps skills](#creeps-skills)
  - [Life time](#life-time)
- [Costs](#costs)
  - [Bodypart cost](#bodypart-cost)
  - [Construction cost](#construction-cost)
- [Примеры када](#%d0%9f%d1%80%d0%b8%d0%bc%d0%b5%d1%80%d1%8b-%d0%ba%d0%b0%d0%b4%d0%b0)
  - [Найти имя комнаты](#%d0%9d%d0%b0%d0%b9%d1%82%d0%b8-%d0%b8%d0%bc%d1%8f-%d0%ba%d0%be%d0%bc%d0%bd%d0%b0%d1%82%d1%8b)

## Creeps skills

+ WORK – ability to harvest energy, construct and repair structures, upgrade controllers.
+ MOVE – ability to move.
+ CARRY – ability to transfer energy.
+ ATTACK – ability of short-range attack.
+ RANGED_ATTACK – ability of ranged attack.
+ HEAL – ability to heal others.
+ TOUGH – "empty" part with the sole purpose of defense.
+ CLAIM - ability to claim territory control.

## Life time
+ CREEP_LIFE_TIME: 1500


Costs
===

[Constants](https://docs.screeps.com/api/#Constants)


## Bodypart cost
+ "move": 50,
+ "work": 100,
+ "attack": 80,
+ "carry": 50,
+ "heal": 250,
+ "ranged_attack": 150,
+ "tough": 10,
+ "claim": 600,


## Construction cost
+ "spawn": 15000,
+ "extension": 3000,
+ "road": 300,
+ "constructedWall": 1,
+ "rampart": 1,
+ "link": 5000,
+ "storage": 30000,
+ "tower": 5000,
+ "observer": 8000,
+ "powerSpawn": 100000,
+ "extractor": 5000,
+ "lab": 50000,
+ "terminal": 100000,
+ "container": 5000,
+ "nuker": 100000,
+ "factory": 100000,

# Примеры када

## Найти имя комнаты
>for(let name in Game.rooms) {
>        
>        //currentRoom is now the instance of the roomobject
>        var currentRoom = Game.rooms[name];
>        var currentRoomName = currentRoom.name;
>        //Example:
>        //console.log("--- > currentRoom energy available: " + currentRoom.energyAvailable );
>        
>        console.log("currentRoomName " + currentRoomName);
>}