import React from 'react'

interface ImageModalProps {
  open: boolean
  imageUrl: string | null
  onClose: () => void
}

const ImageModal: React.FC<ImageModalProps> = ({ open, imageUrl, onClose }) => {
  if (!open || !imageUrl) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div className='absolute inset-0 bg-black/60' onClick={onClose}></div>
      <div className='relative z-10 max-h-[90vh] max-w-[90vw]'>
        <button
          onClick={onClose}
          className='absolute -top-6 right-0 z-20 rounded-full bg-white p-1 text-gray-700 shadow'
        >
          ✕
        </button>
        <img src={imageUrl} alt='attachment' className='max-h-[90vh] max-w-[90vw] rounded-md object-contain' />
      </div>
    </div>
  )
}

export default ImageModal
