Central Control
===================

This is a bespoke project that controls my home.

With the current state of home-automation and IoT, buying into any specific system (Apple HomeKit, Google, WeMo, SmartThings, etc...) seems risky. It is quite probable most people will end up with lots of expensive gadgets in their home that refuse to talk to each other, and many that are destined to be the BetaMax's of home automation systems.

To avoid this, I created my own server, which handles all automation tasks. It is very much a work in progress, and can be quite hacky in places. Essentially, it abstracts a wide range of different devices (Philips Hue, Belkin WeMo, Logitech Harmony, Infrared controlled devices, custom made wall switches, motion sensors, and custom made blind controllers) to a simple HTTP REST interface. 

Other systems, such as HomeKit (via homebridge) connect into this system, but the logic and rules live within this project, keeping such configuration agnostic with regard to closed, third party systems. This approach prevents me getting locked into a platform, but stilling being able to use one or more of them. For example, HomeKit works with this project, and Amazon Echo could work along side it too (although I haven't bought one of those yet)

Feel free to use any of the code in whole or part.

---

Supported Services & Devices
-------------


### Custom Blind Controller

![Blind Controller](https://raw.githubusercontent.com/dermotos/blind-actor/master/Hardware%20Schematic/schematic.png)

A custom made blind controller running on a [Particle Photon](https://particle.io) microcontroller.

Checkout the [Repo & hardware schematic](http://github.com/dermotos/blind-actor)


### Custom Light Switches

![Custom light switch](https://raw.githubusercontent.com/dermotos/generic-sensor/master/hardware%20schematic/Schematic-Generic-Sensor.png)

Custom made, configurable wall switches. These devices are also powered by the [Particle Photon](https://particle.io). They consist of up to four momentary buttons with LED feedback, a fader control and up to two motion sensors. 

Checkout the [Repo & hardware schematic](http://github.com/dermotos/blind-actor)


### IR Devices (via Logitech Harmony Home Hub)

![Logitech Harmony](http://assets.ilounge.com/images/reviews_logitech/harmonysmartcontrol/1.jpg)

Control of IR devices is handled via command line calls to [HarmonyHubCLI](https://github.com/sushilks/harmonyHubCLI). This allows the system to control TVs, receivers, fans, air conditioning and more.

### WeMo Switches

![Logitech Harmony](https://www.belkin.com/images/productmt/579150/372.jpg)

Control of WeMo switches are also handled via command line.

### Philips Hue Bulbs

![Logitech Harmony](https://cnet1.cbsistatic.com/hub/i/r/2013/08/27/b54cee95-84b8-11e3-beb9-14feb5ca9861/thumbnail/770x433/3819299edbb781c0e9677e33ce980515/2Z9A2731_940x671.jpg)

Control of Philips Hue light bulbs.



---

Configuration of actions is maintained within the configuration file `action-map.json`
Actions are arranged into groups. Automatic mapping of actions occurs if their name/group matches the name/action of a light switch. For example the scenes in action `button-north-pressed` in the group `kitchen` will automatically be triggered when an action anmed `'button-north-pressed` originates from a device named `kitchen`.

Multiple scenes and events can be triggered from within each action, allowing complex scenes to be created easily that span multiple platforms, such as lights, IR devices, custom hardware (eg: blind control) and more.

*This readme will be updated soon to give a better description of this project*
