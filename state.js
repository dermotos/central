//
// State keeps track of various things like blind positions, which humans are in the house, which are in bed,
// modes such as midnightMode or tvWatchingMode or kitchenWorkMode.
//
// After the state changes, a function runs and checks rules (possibly another module) and subsequently triggers
// recipes if necessary.
//
//
//
// eg: state changed.
//
// rules engine checks state:
//
// if(goingToBedMode == true && ash and dermot are in bed)
// //turn off all house lights (this wouldn't actually be used, might be just lying on the bed, some thought will need to be put into these rules)
