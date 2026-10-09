import React from 'react';
import {Composition} from 'remotion';
import {ReelTemplate, ReelProps} from './reel-template/ReelTemplate';
import defaults from './reel-template/reel.json';
import {EjemploTaller} from './ejemplo-taller/EjemploTaller';
import {EjemploTikTok} from './ejemplo-tiktok/EjemploTikTok';
import {EjemploTestimonios} from './ejemplo-testimonios/EjemploTestimonios';
import {TOTAL_FRAMES} from './ejemplo-testimonios/data';

/**
 * Composiciones:
 *  - ReelTemplate        plantilla limpia, se controla con src/reel-template/reel.json (funciona sin video)
 *  - EjemploTaller       talking head selfie con tarjetas animadas (necesita public/ejemplo-taller/aroll.mp4)
 *  - EjemploTikTok       video de producto estilo TikTok Shop (necesita public/ejemplo-tiktok/aroll.mp4 + music.mp3)
 *  - EjemploTestimonios  tarjetas de testimonios + video pizarra (necesita public/ejemplo-testimonios/*.mp4 + music.mp3)
 * Los ejemplos NO traen sus videos (eran de clientes): sirven para leer el código y copiar ideas.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ReelTemplate"
        component={ReelTemplate}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={Math.ceil((defaults as ReelProps).durationSec * 30)}
        defaultProps={defaults as ReelProps}
        calculateMetadata={({props}) => ({durationInFrames: Math.max(1, Math.ceil(props.durationSec * 30))})}
      />
      <Composition id="EjemploTaller" component={EjemploTaller} width={1080} height={1920} fps={30} durationInFrames={Math.ceil(29.833 * 30)} />
      <Composition id="EjemploTikTok" component={EjemploTikTok} width={1080} height={1920} fps={30} durationInFrames={Math.ceil(20.3 * 30)} />
      <Composition id="EjemploTestimonios" component={EjemploTestimonios} width={1080} height={1920} fps={30} durationInFrames={TOTAL_FRAMES} />
    </>
  );
};
