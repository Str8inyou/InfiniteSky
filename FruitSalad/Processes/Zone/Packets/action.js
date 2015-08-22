// TODO: When character is not able to move, we just dont update the values.
// But we need to send the response back to the client.

var Buff = restruct.
	int16lu('Amount').
	int16lu('Time');

var BuffHS = restruct.
	int8lu('Amount').
	int8lu('Stacks').
	int16lu('Time');

Zone.CharName_Length = 12;
Zone.UsernameLength = 13;
Zone.PasswordLength = 64;
Zone.AccountSecurityPinLength = 4;
//Zone.VersionRequired 60221 a much older version dakk's client is this
Zone.VersionRequired = 60322;
Zone.AccountSecurityPinLength = 4;
Zone.UserIDLength = 8 ;// a max length of 8 meens they are using unsigned long long or unsignedint64 a standard database entry for primary key :)
Zone.AvatarNameLength = 12;
Zone.IPAddressLength = 15;
Zone.GuildName_Length = 12;
Zone.GuildTag_Length = 12;
Zone.MessageLength = 50;
Zone.GiftCodeLength = 32;

// Zone.MAX_SILVER = 2147483647;

Zone.send.PersonalShopItem = restruct.
	int32lu('ItemID').
	int32lu('InventoryIndex').
	int32lu('Amount').
	int32lu('Price').
	int8lu('Enchant').
	int8lu('Combine').
	pad(2);

Zone.send.Compress_Hairer = restruct.
  int8lu('packetID').
  int8lu('isCompressed');

Zone.send.Action = restruct.
  int32lu('CharacterID'). // 2
  int32lu('NodeID'). // 6
  string('Name', Zone.CharName_Length+1). // 10
  string('Demostrater', Zone.CharName_Length+1). // 23
  string('Child', Zone.CharName_Length+1). // 36
  int8lu(''). // 49
  int32lu('FactionCapeThing'). // 50
  int32lu(''). // 54
  int32lu('TraitorFlag'). // 58
  int32lu(''). // 62
  int32lu('decHead'). // 66
  int32lu('GlowItems'). // 70
	int8lu('').
	int8lu('').
	int8lu('').
  int8lu('').
  int32lu('decShoulders').
  int32lu('Clan').
  int32lu('Gender').
  int32lu('Hair').
  int32lu('Face').
  int32lu('Level'). // 92
  int32lu('Honor').
  struct('Necklace', structs.Equipt).
  struct('Cape', structs.Equipt).
  struct('Outfit', structs.Equipt).
  struct('Gloves', structs.Equipt).
  struct('Ring', structs.Equipt).
  struct('Boots', structs.Equipt).
  struct('CalbashBottle', structs.Bottle).
  struct('Weapon', structs.Equipt).
  struct('Pet', structs.Pet).
  int32lu('applyGlowItems').
  string('GuildName', Zone.GuildName_Length+1).
  int8lu('').
  int8lu('').
  int8lu('').
  int32lu('LeaderFlag').
  int8lu('LeaderSubFlag').
  int32lu('').
  int32lu('').
  int32lu('').
  int8lu('').
  int8lu('').
  int8lu('').
  int8lu('InParty').
  int32lu('').
  int32lu('').
  int32lu('').
  int8lu('').
  int8lu('').
  int8lu('').
  int32lu('Stance').
  int32lu('Skill').
  float32l('Frame').
  struct('Location',structs.CVec3).
  struct('LocationTo',structs.CVec3).
  float32l('Direction').
  int32lu('TargetNodeID').
  int32lu('TargetID').
  int32lu('TargetUnk').
  int32lu('TargetUnk2').
  int32lu('SkillID').
  int32lu('SkillLevel').
  struct('LocationNew',structs.CVec3).
  float32l('FacingDirection').
  int32lu('MaxHP').
  int32lu('CurrentHP').
  int32lu('MaxChi').
  int32lu('CurrentChi'). // === 372
  struct('Buffs', Buff, 14). //22
  struct('BuffHS', BuffHS).
  struct('Buffs2', Buff, 7).

  int32lu('MonsterDisguise'). // The ID of a monster to disguise as

  int32lu('').
  int32lu('').

  int8lu('InDuel').
  int8lu('InDuelChallenger'). // 0 blue 1 gold
  int8lu('').
  int8lu('Store'). // 0 none 1 open 2 open but empty

  string('StoreName', 28).
  struct('StoreItems', Zone.send.PersonalShopItem, 25).
  int32lu('').
  int32lu('').
  int32lu('').
  int32lu('').
  int32lu(''). // 130
  int32lu('').
  int32lu('').
  int32lu('').
  int32lu('').
  int32lu(''). // 135
  int32lu('').
  int32lu('').
  int32lu('');

Zone.recv.Action = restruct.
  int32lu('Stance').
  int32lu('Skill').
  float32l('Frame').
  struct('Location', structs.CVec3).
  struct('LocationTo', structs.CVec3).
  float32l('Direction').
  int32lu('TargetNodeID').
  int32lu('TargetID').
	int32lu('TargetUnk').
	int32lu('TargetUnk2').
	int32lu('SkillID').
	int32lu('SkillLevel').
  struct('LocationNew', structs.CVec3).
  float32l('FacingDirection').
  pad(8);

ZonePC.Set(0x03, {
  Restruct: Zone.recv.Action,
  function: function ActionHearthBeatHandler(client, input) {
    client.character.RealX = input.Location.X;
    client.character.RealY = input.Location.Y;
    client.character.RealZ = input.Location.Z;

		// client.character.save();

    // TODO: Simulate serverside movement and comparison.
  }
});

ZonePC.Set(0x04, {
  Restruct: Zone.recv.Action,
  function: function HandleDuringAction(client, input) {
    client.character.state.Frame = input.Frame;
    client.character.state.Stance = input.Stance;
    client.character.state.Skill = input.Skill;
    client.character.state.FacingDirection = input.FacingDirection;
    client.character.state.Direction = input.Direction;

    client.character.RealX = input.Location.X;
    client.character.RealY = input.Location.Y;
    client.character.RealZ = input.Location.Z;

    client.character.state.Location.X = input.Location.X;
    client.character.state.Location.Y = input.Location.Y;
    client.character.state.Location.Z = input.Location.Z;

    // TODO: Send out updates for things that come into focus.
    // If walking running or jumping action
    // check time since this was last done against some configured value.(maybe 1 sec?)
    // get what is around the character (excluding the character)
    // send their update packets to the client
    // store time this was done

    client.node.update();
    Zone.sendToAllArea(client, false, client.character.state.getPacket(), config.network.viewable_action_distance);

		client.character.save();
  }
});

ZonePC.Set(0x05, {
  Restruct: Zone.recv.Action,

  function: function ActionHandler(client, input) {
		console.log("New action ("+input.Skill+")");

		// TODO: Check if target exists and able to confirm the action against it.
		client.character.state.TargetNodeID = input.TargetNodeID;
		client.character.state.TargetID = input.TargetID;
		client.character.state.TargetUnk = input.TargetUnk;
		client.character.state.TargetUnk2 = input.TargetUnk2;

    client.character.state.Frame = input.Frame;
    client.character.state.Stance = input.Stance;
    client.character.state.Skill = input.Skill;
    client.character.state.FacingDirection = input.FacingDirection;
    client.character.state.Direction = input.Direction;

    client.character.RealX = input.Location.X;
    client.character.RealY = input.Location.Y;
    client.character.RealZ = input.Location.Z;

    client.character.state.Location.X = input.Location.X;
    client.character.state.Location.Y = input.Location.Y;
    client.character.state.Location.Z = input.Location.Z;

    client.character.state.LocationTo.X = input.Location.X;
    client.character.state.LocationTo.Y = input.Location.Y;
    client.character.state.LocationTo.Z = input.Location.Z;

    client.character.state.LocationNew.X = input.LocationNew.X;
    client.character.state.LocationNew.Y = input.LocationNew.Y;
    client.character.state.LocationNew.Z = input.LocationNew.Z;
		client.node.update();

    switch(input.Skill){
        case 66:
        case 61:
        case 68:
        case 75:
        case 67:
        case 62:
				client.character.state.skillUsed = true;
        break;

				// Fujin general skills
				case 32:
				Zone.sendToAllArea(client, true, client.character.state.getPacket(), config.network.viewable_action_distance);
				break;

				// Fujin general buffs
				case 40:
				case 41:
				Zone.sendToAllArea(client, true, client.character.state.getPacket(), config.network.viewable_action_distance);
				break;

				// Fujin katana skills
				case 42:
				case 43:
				case 44:
				case 60:
				Zone.sendToAllArea(client, true, client.character.state.getPacket(), config.network.viewable_action_distance);
				break;

				// Weapon basic attacks.
				// Attack when animation has finished.
				case 5:
				case 6:
				case 7:
				console.log("Target node:", input.TargetNodeID);
				Zone.QuadTree.findNodeById(input.TargetNodeID, function(node){
					console.log("Found target node", node.id);
					client.character.DamageDealer.attack(node);
					Zone.sendToAllArea(client, true, client.character.state.getPacket(), config.network.viewable_action_distance);
				});
				break;

				// Walking
				case 2:
				console.log("test");
				Zone.sendToAllArea(client, true, client.character.state.getPacket(), config.network.viewable_action_distance);
				break;


        default:
				console.log("Unknown Action");
        Zone.sendToAllArea(client, true, client.character.state.getPacket(), config.network.viewable_action_distance);
        break;
    }
  }
});

Zone.recv.onHit = restruct.
	int32lu('unk').
	int32lu('CharacterID').
	int32lu('NodeID').
	int32lu('TargetID').
	int32lu('TargetNodeID').
	pad(44);

ZonePC.Set(0x15, {
	Restruct: Zone.recv.onHit,
	function: function(client, input){
		// TODO: Confirming if I actually was able to hit the target. Input contains attacker and the target.

		// console.log(input);
	}
})

Zone.recv.useSkill = restruct.
	int32lu('ChiUsage').
	int32lu('SkillID').
	int32lu('SkillLevel').
	int32lu('ChiUsage2').
	pad(8);

ZonePC.Set(0x19, {
	Restruct: Zone.recv.useSkill,
	function: function useSkill(client, input){
		// TODO: Calculate chi usage.

		console.log("Using skill: ", client.character.state.Skill);
		// console.log(input);

		client.node.update();
    client.character.state.SkillID = input.SkillID;
		client.character.state.SkillLevel = input.SkillLevel;
		if(client.character.state.skillUsed)
		Zone.sendToAllArea(client, true, client.character.state.getPacket(), config.network.viewable_action_distance);
		client.character.state.skillUsed = false;
	}
});


ZonePC.Set(0x8B, {
    function: function(client){
			if(!client.character.state.sendPlayersAround){
				client.character.state.sendPlayersAround = true;
				var found = Zone.QuadTree.query({
					CVec3: client.character.state.Location,
					radius: config.network.viewable_action_distance,
					type: ['client']
				});

				for (var i = 0; i < found.length; i++) {
					var f = found[i];
					if(f !== client) client.write(f.object.character.state.getPacket());
				}
			}

      Zone.broadcastStates(client);
    }
});
