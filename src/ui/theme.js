import { StyleSheet } from "react-native";

export const colors = {
  sky: "#9BD7E8", terrain: "#263B25", panel: "#172318", paper: "#F4ECD6",
  ink: "#20261F", hazardYellow: "#F5C842", explosionOrange: "#F06A2A",
  grassGreen: "#8FCB45", waterBlue: "#2789B8", focus: "#72D7FF", error: "#FF766D",
  muted: "#AEB9AA", line: "#40513D", white: "#FFFFFF",
};

export const teamColors = {
  BLUE: "#5DB6F2", RED: "#F16B62", YELLOW: "#F5D94E", GREEN: "#7FCB57",
  PURPLE: "#BA8EE8", GREY: "#BEC6C8",
};

export const fonts = { display: "BattleDisplay", body: "RulesText" };
export const layout = { contentMax: 760, touch: 48 };

export const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:colors.terrain},app:{flex:1,backgroundColor:colors.terrain},loading:{color:colors.paper,padding:24,fontFamily:fonts.body},
  content:{width:"100%",maxWidth:layout.contentMax,alignSelf:"center",paddingHorizontal:18,paddingTop:20,paddingBottom:120},
  topbar:{height:64,paddingHorizontal:20,flexDirection:"row",alignItems:"center",justifyContent:"space-between",borderBottomWidth:1,borderBottomColor:colors.line,backgroundColor:colors.panel},
  brand:{color:colors.paper,fontFamily:fonts.display,fontSize:16,letterSpacing:.7},brandAccent:{color:colors.grassGreen},
  dot:{color:colors.grassGreen,fontSize:18},
  eyebrow:{flexDirection:"row",alignItems:"center",gap:10,marginBottom:12},eyebrowText:{color:colors.muted,fontFamily:fonts.body,fontSize:12,fontWeight:"700",letterSpacing:1.4},
  pill:{backgroundColor:"#304B25",paddingHorizontal:10,paddingVertical:6,borderRadius:20},orangePill:{backgroundColor:"#71361F"},pillText:{color:colors.paper,fontFamily:fonts.body,fontWeight:"700",fontSize:11,letterSpacing:.6},
  heroBanner:{borderRadius:14,padding:18,borderLeftWidth:8,marginBottom:8},hero:{color:colors.ink,fontFamily:fonts.display,fontSize:32,lineHeight:39},title:{color:colors.paper,fontFamily:fonts.display,fontSize:29,lineHeight:36},
  subtle:{color:colors.muted,fontFamily:fonts.body,fontSize:16,lineHeight:24,marginTop:7},label:{color:colors.muted,fontFamily:fonts.body,fontSize:11,fontWeight:"700",letterSpacing:1.1},error:{color:colors.error,fontFamily:fonts.body,fontSize:15,lineHeight:22},notice:{padding:12},
  teamRow:{marginTop:22},teamButtons:{flexDirection:"row",flexWrap:"wrap",gap:8,marginTop:9},teamToken:{minHeight:48,minWidth:48,flexDirection:"row",alignItems:"center",gap:8,borderWidth:2,borderColor:colors.line,borderRadius:24,paddingHorizontal:14},tokenDot:{width:14,height:14,borderRadius:7,borderWidth:2,borderColor:colors.ink},teamText:{color:colors.paper,fontFamily:fonts.body,fontWeight:"700",fontSize:13},activeTeam:{borderColor:colors.focus,backgroundColor:"#29432A"},
  teamStatus:{borderWidth:2,borderColor:colors.line,borderRadius:10,padding:6},eliminated:{opacity:.55,borderColor:colors.explosionOrange},counterLabel:{color:colors.muted,fontFamily:fonts.body,fontSize:10,fontWeight:"700",marginTop:6,textAlign:"center"},counterRow:{flexDirection:"row",alignItems:"center",justifyContent:"center",gap:7},counterValue:{color:colors.paper,fontFamily:fonts.body,fontWeight:"700",minWidth:14,textAlign:"center"},finalBanner:{backgroundColor:"#482D1F",borderColor:colors.explosionOrange,borderWidth:2,borderRadius:12,padding:14,marginTop:16},finalTitle:{color:colors.explosionOrange,fontFamily:fonts.display,fontSize:20,letterSpacing:2},finalText:{color:colors.paper,fontFamily:fonts.body,fontWeight:"700",marginTop:4},
  card:{backgroundColor:colors.paper,borderRadius:8,padding:20,marginTop:18,borderWidth:2,borderColor:"#CDBE98",shadowColor:"#000",shadowOpacity:.2,shadowRadius:8,shadowOffset:{width:0,height:4},elevation:4},cardLabel:{color:"#526248",fontFamily:fonts.body,fontSize:11,fontWeight:"700",letterSpacing:1},stepTitle:{color:colors.ink,fontFamily:fonts.display,fontSize:22,lineHeight:29,marginTop:14},stepBody:{color:colors.ink,fontFamily:fonts.body,fontSize:17,lineHeight:26,marginTop:8},
  finalMission:{borderColor:colors.explosionOrange,borderWidth:5},
  markers:{flexDirection:"row",gap:7,marginTop:14,flexWrap:"wrap"},marker:{width:30,height:30,borderRadius:8,alignItems:"center",justifyContent:"center",backgroundColor:"#D9CDAF",borderWidth:2,borderColor:"#A99B78"},markerDone:{backgroundColor:colors.grassGreen,borderColor:"#52752D"},markerCurrent:{backgroundColor:colors.hazardYellow,borderColor:colors.ink,transform:[{rotate:"-3deg"}]},markerText:{color:colors.ink,fontFamily:fonts.body,fontWeight:"700"},
  sectionTitle:{color:colors.hazardYellow,fontFamily:fonts.body,fontSize:12,fontWeight:"700",letterSpacing:1.4,marginTop:28,marginBottom:10},sourceBadge:{alignSelf:"flex-start",backgroundColor:"#E2D6B7",borderRadius:12,paddingHorizontal:10,paddingVertical:7,marginTop:12},source:{color:"#455245",fontFamily:fonts.body,fontSize:13},
  stepRow:{minHeight:52,flexDirection:"row",alignItems:"center",borderBottomWidth:1,borderBottomColor:colors.line,paddingHorizontal:8},selectedStep:{backgroundColor:"#334A2C",borderRadius:8,borderBottomColor:colors.grassGreen},stepNumber:{width:30,color:colors.muted,fontFamily:fonts.body,fontWeight:"700"},selectedNumber:{color:colors.hazardYellow},stepText:{color:"#D7DED2",fontFamily:fonts.body,fontSize:16,flex:1},selectedText:{color:colors.white,fontWeight:"700"},chevron:{color:colors.hazardYellow,fontSize:24},
  button:{minHeight:48,justifyContent:"center",alignItems:"center",paddingHorizontal:16,marginTop:10,borderWidth:2,borderColor:colors.line,borderRadius:10},buttonPressed:{transform:[{translateY:1}],opacity:.78},buttonFocused:{borderColor:colors.focus},buttonPrimary:{backgroundColor:colors.hazardYellow,borderColor:colors.ink,minHeight:58},buttonText:{color:colors.paper,fontFamily:fonts.body,fontSize:16,fontWeight:"700",textAlign:"center"},buttonPrimaryText:{color:colors.ink,fontFamily:fonts.display,fontSize:15,textAlign:"center"},disabled:{opacity:.38},controls:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"},
  hazard:{borderWidth:2,borderColor:colors.hazardYellow,borderRadius:10,padding:14,marginTop:22,backgroundColor:"#482D1F"},hazardText:{color:colors.hazardYellow,fontFamily:fonts.display,fontSize:14},statusRow:{minHeight:56,flexDirection:"row",alignItems:"center",justifyContent:"space-between",gap:10},
  input:{minHeight:112,marginTop:22,backgroundColor:colors.paper,borderColor:"#B8AA88",borderWidth:2,borderRadius:10,padding:15,color:colors.ink,fontFamily:fonts.body,fontSize:17,lineHeight:25,textAlignVertical:"top"},search:{minHeight:52,marginVertical:16,backgroundColor:colors.paper,borderWidth:2,borderColor:"#B8AA88",borderRadius:10,paddingHorizontal:15,color:colors.ink,fontFamily:fonts.body,fontSize:17},
  answer:{backgroundColor:colors.paper,borderRadius:8,padding:20,marginTop:20,borderTopWidth:7,borderTopColor:colors.grassGreen},answerHeading:{color:"#526248",fontFamily:fonts.body,fontSize:12,fontWeight:"700",letterSpacing:1.4,marginTop:12},answerTitle:{color:colors.ink,fontFamily:fonts.display,fontSize:20,lineHeight:27,marginTop:6},resolution:{color:colors.ink,fontFamily:fonts.body,fontSize:17,lineHeight:26,marginTop:8},answerMeta:{flexDirection:"row",marginTop:12},ruleRow:{minHeight:48,borderTopWidth:1,borderTopColor:"#CFC3A5",paddingVertical:13},ruleName:{color:"#294B29",fontFamily:fonts.body,fontWeight:"700",fontSize:17},ruleBody:{color:colors.ink,fontFamily:fonts.body,fontSize:17,lineHeight:26,marginTop:5},
  setupRow:{flexDirection:"row",alignItems:"center",gap:8,marginTop:8},teamInput:{flex:1,minWidth:70,minHeight:48,color:colors.ink,backgroundColor:colors.white,borderWidth:2,borderColor:"#B8AA88",borderRadius:8,paddingHorizontal:10,fontFamily:fonts.body,fontSize:16},
  tabs:{position:"absolute",bottom:0,left:0,right:0,height:78,flexDirection:"row",backgroundColor:colors.panel,borderTopWidth:1,borderTopColor:colors.line},tab:{flex:1,minHeight:64,alignItems:"center",justifyContent:"center",gap:3},tabPressed:{backgroundColor:"#2B3B2A"},tabText:{color:colors.muted,fontFamily:fonts.body,fontSize:12,fontWeight:"700"},activeTab:{color:colors.hazardYellow},
});
