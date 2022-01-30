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

## Misc Commands

`/choose`: randomly chooses one of any number of given options, separated by space.

`/ping`: classic ping, just to see if the bot is alive

`/remind <string> <time>`: pings you in X time about <reminder>. <time> format must be: Minutes Hours Days; larger time gaps can be dropped if not necessary (i.e. you can choose to not have Hours and Days if you want a reminder in 15 minutes; in that case, the command would look like `/remind string: do this time: 15`)

## TODO Roadmap

- [x] Check to make sure user has a character when running task commands
- [x] Implement permanent stat increasing items
- [x] Implement rolling
- [ ] Implement rate up
- [ ] Add more items to the gacha list
- [ ] Implement nicely formatted embedded messages
- [ ] Implement nicely formatted embedded messages especially for /rpg itemlist
- [ ] Implement dailies
- [x] Implement fight attempts
- [ ] Implement limited fight attempts
- [ ] Task add currently overrides duplicates
- [x] Remind command
- [ ] Reminds built into tasks
- [ ] Help command

# Important Commands

## Task Subcommands

All task subcommands require a <task_name> parameter.

`/task get <task_name>`: get a list of your current tasks.

`/task add <task_name>`: add a task to your list of today's tasks.

`/task complete <task_name>`: mark a task as completed, and get 1 gold in compensation!

`/task remove <task_name>`: remove a task from your list (if you don't plan on doing it).

## RPG Subcommands

Many rpg subcommands have an optional <other> parameter, that lets you run the command as if you were another user (the other person needs a character too).

`/rpg create`: create a new character and profile. This has to be done before any other commands (if you want them to work).

`/rpg profile <optional: other>`: view your character profile

`/rpg roll <optional: multi> <optional: other>`: roll the gacha! (or roll it 10x)

`/rpg inventory <optional: other>`: view your inventory

`/rpg fight`: take on the next stage!

`/rpg itemlist`: lists all items currently in the game
