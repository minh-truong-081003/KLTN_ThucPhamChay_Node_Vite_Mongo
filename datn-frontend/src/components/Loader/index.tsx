import styles from './Loader.module.scss'
import { pause } from '../../utils/pause'
import { useState, useEffect } from 'react'

const Loader = () => {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    pause(2000).then(() => setIsLoading(false))
  }, [])

  return (
    <div
      className={`${styles.preloader} ${
        !isLoading ? 'opacity-0 pointer-events-none ' : 'opacity-100'
      } transition-opacity duration-700`}
    >
      {/* <div className={styles.wrapLoading}>
        <div className={styles.loader}>Loading...</div>
      </div> */}
      <div className={`${styles.wrapLoading2} select-none`}>
        <img
          className={`w-[250px] max-w-[250px] ${styles.loader}`}
          src='https://png.pngtree.com/png-clipart/20230801/original/pngtree-vegan-icon-picture-image_7816412.png'
          alt=''
        />
      </div>
    </div>
  )
}

export default Loader
