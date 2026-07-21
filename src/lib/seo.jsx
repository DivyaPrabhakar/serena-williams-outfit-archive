// Per-page <head> — unique title/description/OG/Twitter/canonical/JSON-LD for
// every route. vite-react-ssg's <Head> writes these into each pre-rendered .html
// file, so crawlers and link-preview bots get real, page-specific metadata without
// executing JS. This is the crux of the SEO work: no two pages should ship the
// same generic <head>.

import { Head } from 'vite-react-ssg'
import { absoluteUrl } from './siteUrl'

const DEFAULT_OG_IMAGE = absoluteUrl('/favicon.svg')

/**
 * @param {object}  props
 * @param {string}  props.title        Full <title> (already page-specific)
 * @param {string}  props.description  Meta description (~150–160 chars)
 * @param {string}  props.path         Route path, e.g. "/wimbledon/2015/final"
 * @param {string} [props.image]       Absolute image URL for OG/Twitter cards
 * @param {string} [props.type]        og:type (default "website")
 * @param {object|object[]} [props.jsonLd]  Schema.org structured data
 * @param {boolean} [props.noindex]    Emit robots noindex (e.g. /admin)
 */
export default function Seo({ title, description, path = '/', image, type = 'website', jsonLd, noindex }) {
  const url = absoluteUrl(path)
  const ogImage = image || DEFAULT_OG_IMAGE
  const blocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Serena Williams Fit-dex" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {blocks.map((block, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(block)}
        </script>
      ))}
    </Head>
  )
}
