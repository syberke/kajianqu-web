type Props = {
  youtubeUrl: string
  title?: string
}

function getYoutubeEmbedUrl(url: string) {
  const regex =
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/i
  const match = url.match(regex)
  const videoId = match?.[1]
  return videoId ? `https://www.youtube.com/embed/${videoId}` : ''
}

export default function YoutubeEmbed({ youtubeUrl, title }: Props) {
  const embedUrl = getYoutubeEmbedUrl(youtubeUrl)

  if (!embedUrl) {
    return <p>URL YouTube tidak valid</p>
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl">
      <iframe
        className="h-full w-full"
        src={embedUrl}
        title={title || 'YouTube video player'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}