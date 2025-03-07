import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity
} from "react-native";
import { moderateScale } from "react-native-size-matters";
import TeamName from "./TeamName";
import OddSelection from "./OddSelection";
import moment from "moment";
import { useLazyQuery, useQuery } from "@apollo/client";
import { GET_TEAM } from "../graph-operations";
import { useSelector } from "react-redux";
import analytics from "@react-native-firebase/analytics";

const BetCardSingle = ({ status, moneyLine, homeName, awayName, homeId, awayId, homeScore, awayScore, onPress, onOddSelected, matchTime, sport, halfStartTime }) => {

  const odds = moneyLine? moneyLine.split(",") :  [];
  let basketball = sport === "basketball";
  let disabled = false;

  if(odds.length < 11)
    odds.unshift(0,0,0);

  if(odds.length <= 3)
    disabled = true

  const user = useSelector(state => state.user);
  const [homeLogo, setHomeLogo] = useState("");
  const [awayLogo, setAwayLogo] = useState("");

  const gameIsInPlay = moment() > moment.unix(matchTime);
  let currentGameTine = status === 1? moment().diff(moment.unix(matchTime), "minutes") :  moment().diff(moment.unix(halfStartTime), "minutes") + 45


  // console.log(status,moment().diff(moment.unix(matchTime), "minutes"),moment.unix(halfStartTime), moment().diff(moment.unix(halfStartTime), "minutes"), currentGameTine)
  if(parseInt(currentGameTine) > 1000)
    currentGameTine = "OT"

  const getHomeTeam = useQuery(GET_TEAM, {
    variables: {
      jsWebToken: user.jsWebToken,
      sport,
      teamId: homeId
    },
    onCompleted(data){
      // console.log("data : ", data);
      setHomeLogo(data.getTeam.logo);
    }
  });

  const getAwayTeam = useQuery(GET_TEAM, {
    variables: {
      jsWebToken: user.jsWebToken,
      sport,
      teamId: awayId
    },
    onCompleted(data){
      // console.log("data : ", data);
      setAwayLogo(data.getTeam.logo);
    }
  });

  // console.log("ID: ", awayLogo, homeLogo )

  const handleOnPress = async () => {
    await analytics().logEvent('click_on_game_card', {
      homeName,
      awayName
    });
  }

  return (
    <TouchableOpacity onPress={handleOnPress} style={styles.container}>
      <View style={styles.contentTeam}>
        <TeamName teamName={homeName} teamLogo={homeLogo}/>
        <View style={{ alignItems: "center"}}>
          <Text style={[styles.text, { fontSize: moderateScale(18), color: gameIsInPlay? "#4DFB47" : "#fff"}, ]}>{gameIsInPlay? `${homeScore} - ${awayScore}` : moment.unix(matchTime).format("DD/MM")}</Text>
          { status === 2 ?
             <Text style={[styles.text, { fontSize: gameIsInPlay? moderateScale(12) : moderateScale(12), color: gameIsInPlay? "#4DFB47" : "#fff"}]}>MT</Text>
            :
            status === 4 ?
              <Text style={[styles.text, { fontSize: gameIsInPlay? moderateScale(12) : moderateScale(12), color: gameIsInPlay? "#4DFB47" : "#fff"}]}>OT</Text>
              :
              <Text style={[styles.text, { fontSize: gameIsInPlay? moderateScale(12) : moderateScale(12), color: gameIsInPlay? "#4DFB47" : "#fff"}]}>{gameIsInPlay? `${currentGameTine}'` : moment.unix(matchTime).format("HH:mm")}</Text>
          }
        </View>
        <TeamName teamName={awayName} teamLogo={awayLogo} left/>
      </View>
      <View style={styles.separatorContent}>
        <View style={styles.separator}/>
        <Text style={styles.text}>Winner</Text>
        <View style={styles.separator}/>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%"}}>
        <OddSelection disabled={disabled} large={basketball} onOddSelected={() => onOddSelected({pick: { name: homeName, num: 1 }, odd: basketball? odds[4] : odds[5], type: "1x2"})} selection={1} odd={basketball? odds[4] : odds[5]}/>
        { !basketball && <OddSelection disabled={disabled} onOddSelected={() => onOddSelected({ pick: { name: "Draw", num: 0}, odd: odds[6], type: "1x2" })} selection={"Draw"} odd={odds[6]} /> }
        <OddSelection disabled={disabled} large={basketball} onOddSelected={() => onOddSelected({pick: { name: awayName, num: 2 }, odd: basketball? odds[5] : odds[7], type: "1x2"})} selection={2} odd={basketball? odds[5] : odds[7]}/>
      </View>
    </TouchableOpacity>
  )
};

const styles = StyleSheet.create({
  container: {
    height: moderateScale(130),
    borderRadius: moderateScale(5),
    backgroundColor: "#140A35",
    padding: moderateScale(5),
    marginVertical: moderateScale(5)
  },
  contentTeam: {
    flexDirection: "row",
    width: "100%",
    padding: moderateScale(10),
    justifyContent: "space-between"
  },
  text: {
    color: "#fff",
    fontFamily: "OpenSans-Semibold",
    fontSize: moderateScale(12)
  },
  separator: {
    height: moderateScale(1),
    backgroundColor: "#A9B8CC",
    width: "30%"
  },
  separatorContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: moderateScale(5)
  }
});

export default BetCardSingle;
