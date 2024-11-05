import { FC } from 'react';
import { motion } from 'framer-motion';
import { Flex } from '@/shared/ui/Flex/Flex';
import { Window } from '@/shared/ui/Window/Window';
import Image from 'next/image';
import { HighlightedText } from './HighlightedText';
import { stories } from './constants';
import styles from './StoryViewer.module.scss';

interface StoryContentProps {
  currentStoryIndex: number;
  buttonText: string;
  progress: number;
  isPaused: boolean;
  handleStoryClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  handleButtonClick: () => void;
  handleTouchStart: () => void;
  handleTouchEnd: () => void;
}

export const StoryContent: FC<StoryContentProps> = ({
  currentStoryIndex,
  buttonText,
  progress,
  isPaused,
  handleStoryClick,
  handleButtonClick,
  handleTouchStart,
  handleTouchEnd
}) => (
  <Window
    isOpen={true}
    btnText={buttonText}
    btnOnClick={handleButtonClick}
    isBtnActive={true}
    height="100%"
    borderRadius="0"
    wrapperBorderRadius="0"
    bg="#F4F7FA"
  >
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={styles.story_viewer}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
    >
      <div className={styles.progress_container}>
        {stories.map((_, index) => (
          <div key={index} className={styles.progress_bar}>
            <div
              className={styles.progress_fill}
              style={{
                width: index < currentStoryIndex 
                  ? '100%' 
                  : index === currentStoryIndex 
                    ? `${progress}%` 
                    : '0%',
                transition: index === currentStoryIndex && !isPaused 
                  ? 'none' 
                  : 'width 0.3s ease'
              }}
            />
          </div>
        ))}
      </div>

      <div className={styles.content} onClick={handleStoryClick}>
        <div className={styles.image_container}>
          <Image
            src={stories[currentStoryIndex].image}
            alt="Story image"
            fill
            priority
            quality={100}
            sizes="100vw"
            style={{
              objectFit: 'contain',
              objectPosition: 'center',
            }}
            className={styles.story_image}
          />
        </div>

        <div className={styles.text_container}>
          <Flex direction="column" gap={8}>
            {stories[currentStoryIndex].description && (
              <HighlightedText 
                text={stories[currentStoryIndex].description}
                highlights={stories[currentStoryIndex].highlights}
                fontSize={20}
              />
            )}
          </Flex>
        </div>
      </div>
    </motion.div>
  </Window>
);