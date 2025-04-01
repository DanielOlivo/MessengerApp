import React from 'react'

export interface Highlight {
    from: number
    to: number
}

export interface SearchCardProps {
    title: string
    content: string
    iconSrc: string

    titleSpan: Highlight
    contentSpan: Highlight
}

export const SearchCard = () => {
  return (
    <div>SearchCard</div>
  )
}
