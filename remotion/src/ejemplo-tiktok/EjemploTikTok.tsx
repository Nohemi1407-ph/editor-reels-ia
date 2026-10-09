import React from 'react';
import {AbsoluteFill} from 'remotion';
import {loadFonts} from '../kit/fonts';
import {VideoLayer} from './VideoLayer';
import {HookTitle, CoverPlate} from './Hook';
import {Captions} from './Captions';
import {Callouts, SoldOutBadge} from './Callouts';
import {EmojiPops} from './EmojiPops';
import {CartCTA} from './CTA';
import {AudioLayer} from './AudioLayer';

loadFonts();

export const EjemploTikTok: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    <VideoLayer />
    <AbsoluteFill>
      <Callouts />
      <SoldOutBadge />
      <CartCTA />
      <Captions />
      <EmojiPops />
      <HookTitle />
      <CoverPlate />
    </AbsoluteFill>
    <AudioLayer />
  </AbsoluteFill>
);
