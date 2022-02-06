# DailyRPG

## Table of Contents

```
-- Intro --
Playing the RPG
Common Commands
Misc Commands
TODO Roadmap
-- Important Commands --
Task Subcommands
RPG Subcommand
```

A Discord bot designed to encourage scheduling and completing tasks on a daily basis.

All tasks expire after 24 hours, or when you tell DailyRPG they are completed.

To get started with DailyRPG, use the command `/rpg create`. From there, you can add tasks with `/task add <task_name>` and finish them with `/task complete <task_name>`.

## Playing the RPG

The idea of the RPG aspect of DailyRPG is to be a gacha style idle RPG. You incrementally defeat an infinite number of stages for...no real reward. Just the bragging rights! To be able to beat any given stage, your stats have to meet some minimum threshold. Every character has 4 stats: STR, DEX, INT, WIZ. To increase your stats, you have to _\~\~roll the gacha\~\~_. Most of the time, rolling will simply give you an item that will permanently increase a stat by a small amount. However, sometimes, you will get an item that will permanently increase a stat by a **large** amount. Even rarer, you can get an item that, when equipped, will increase a stat by a **really large** amount.

Now, how do you get the gacha points! By doing ~~(and telling DailyRPG that you did)~~ tasks, you can accrue up gold, which is then used for the gacha.

## Common Commands

There are two important groups of commands: `task` and `rpg`. Invoking _just_ `/task` or `/rpg` will _not_ do anything; you must invoke them with proper subcommands. A list of all their subcommands can be found at the bottom of this README. 

There is also a remind command--`/remind <string> <optional: minutes> <optional: hours> <optional: days>`--that pings you in X time about `<string>`.

## Misc Commands

`/choose`: randomly chooses one of any number of given options, separated by space.

`/ping`: classic ping, just to see if the bot is alive

`/help <optional: page_number>`: brings up a specified help page (default page 1)

## TODO Roadmap

Finished
- [x] Check to make sure user has a character when running task commands
- [x] Implement permanent stat increasing items
- [x] Implement rolling
- [x] Implement dailies - make them reset everyday
- [x] Daily Streaks
- [x] Implement fight attempts
- [x] Remind command
- [x] Change fight algorithm
- [x] Add a message for auto-used items
- [x] Remove timeout on tasks, add custom timeouts
- [x] Implement nicely formatted embedded messages

Unfinished
- [ ] Implement rate up
- [ ] Add more items to the gacha list
- [ ] Implement nicely formatted embedded messages especially for /rpg itemlist
- [ ] Implement equipping stuff
- [ ] Implement limited fight attempts
- [ ] Reminds built into tasks
- [ ] Help command
- [ ] Add error catches for everything that could go wrong

# Important Commands

## Task Subcommands

All task subcommands require a <task_name> parameter.

`/task list <task_name>`: lists your current tasks.

`/task add <task> <optional: minutes> <optional: hours> <optional: days>`: adds a task, with a given time limit (default 24 hours)'

`/task complete <task>`: complete a task, and get one gold in compensation

`/task remove <task>`: remove a task you don't plan on doing

## RPG Subcommands

Many rpg subcommands have an optional <other> parameter, that lets you run the command as if you were another user (the other person needs a character too).

`/rpg create`: create a new character and profile. This has to be done before any other commands (if you want them to work).

`/rpg profile <optional: other>`: view your character profile

`/rpg roll <optional: multi> <optional: other>`: roll the gacha! (or roll it 10x)

`/rpg inventory <optional: other>`: view your inventory

`/rpg fight`: take on the next stage!

## Dailies Subcommands

`/daily list`: look at all your dailies

`/daily add`: add a new daily

`/daily complete`: complete a daily

`/daily remove`: remove a daily
