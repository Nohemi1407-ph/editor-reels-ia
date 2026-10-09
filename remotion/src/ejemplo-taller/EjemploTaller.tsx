import React from 'react';
import {AbsoluteFill} from 'remotion';
import {loadFonts} from '../kit/fonts';
import {VideoLayer} from './VideoLayer';
import {Sfx} from './Sfx';
import {CaptionPills, ShopTourCaptions} from './Captions';
import {TeoriaReal} from './inserts/TeoriaReal';
import {TopFront} from './inserts/TopFront';
import {Fallas} from './inserts/Fallas';
import {Factura} from './inserts/Factura';
import {Herramienta} from './inserts/Herramienta';
import {Diagnostico} from './inserts/Diagnostico';
import {LinkCTA} from './inserts/LinkCTA';

loadFonts();

export const EjemploTaller: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <VideoLayer />
      <AbsoluteFill>
        <TeoriaReal />
        <ShopTourCaptions />
        <TopFront />
        <Fallas />
        <Factura />
        <Herramienta />
        <Diagnostico />
        <CaptionPills />
        <LinkCTA />
      </AbsoluteFill>
      <Sfx />
    </AbsoluteFill>
  );
};
