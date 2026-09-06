import React from "react";
import { Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, styles, teamColors } from "../theme";

export function Pill({ children, tone = "green" }) { return <View style={[styles.pill,tone === "orange"&&styles.orangePill]}><Text style={styles.pillText}>{children}</Text></View>; }
export function Button({children,onPress,disabled=false,primary=false,label,selected,surface="dark"}) {
  const lightSurface = surface === "light";
  return <Pressable
    accessibilityRole="button"
    accessibilityLabel={label}
    accessibilityState={{disabled,...(selected===undefined?{}:{selected})}}
    disabled={disabled}
    onPress={onPress}
    style={({pressed,focused})=>[
      styles.button,
      !primary&&(lightSurface?styles.buttonSecondaryLight:styles.buttonSecondaryDark),
      primary&&styles.buttonPrimary,
      selected&&!primary&&(lightSurface?styles.buttonSelectedLight:styles.buttonSelectedDark),
      pressed&&!disabled&&styles.buttonPressed,
      pressed&&!disabled&&!primary&&(lightSurface?styles.buttonPressedLight:styles.buttonPressedDark),
      disabled&&(primary?styles.buttonPrimaryDisabled:(lightSurface?styles.buttonDisabledLight:styles.buttonDisabledDark)),
      focused&&(lightSurface?styles.buttonFocusedLight:styles.buttonFocusedDark),
    ]}
  >
    <Text style={[
      primary?styles.buttonPrimaryText:(lightSurface?styles.buttonTextLight:styles.buttonTextDark),
      disabled&&(primary?styles.buttonPrimaryTextDisabled:(lightSurface?styles.buttonTextDisabledLight:styles.buttonTextDisabledDark)),
    ]}>{children}</Text>
  </Pressable>;
}
export function TeamToken({name,selected,onPress,disabled=false}) { const color=teamColors[name]||colors.white; return <Pressable accessibilityRole="button" accessibilityLabel={`${name} team${selected?", active":""}`} accessibilityState={{selected,disabled}} disabled={disabled} onPress={onPress} style={({pressed,focused})=>[styles.teamToken,selected&&styles.activeTeam,disabled&&styles.disabled,pressed&&styles.buttonPressed,focused&&styles.buttonFocusedDark]}><View style={[styles.tokenDot,{backgroundColor:color}]}/><Text style={styles.teamText}>{name}</Text></Pressable>; }
export function StepMarkers({step,count,onSelect}) { return <View accessibilityRole="tablist" style={styles.markers}>{Array.from({length:count},(_,i)=><Pressable key={i} accessibilityRole="tab" accessibilityLabel={`Turn step ${i+1} of ${count}`} accessibilityState={{selected:i===step}} onPress={()=>onSelect(i)} style={({focused})=>[styles.marker,i<step&&styles.markerDone,i===step&&styles.markerCurrent,focused&&styles.buttonFocusedLight]}><Text style={styles.markerText}>{i+1}</Text></Pressable>)}</View>; }
export function TabIcon({name,active}) { const icons={Play:"gamepad-variant-outline",Ask:"comment-question-outline",Rules:"book-open-page-variant-outline"}; return <MaterialCommunityIcons name={icons[name]} size={25} color={active?colors.hazardYellow:colors.muted} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"/>; }
