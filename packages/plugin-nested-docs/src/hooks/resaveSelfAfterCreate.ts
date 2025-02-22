import type { CollectionAfterChangeHook, CollectionConfig } from 'payload/types'

import type { Breadcrumb } from '../types'

interface DocWithBreadcrumbs {
  breadcrumbs: Breadcrumb[]
}

// This hook automatically re-saves a document after it is created
// so that we can build its breadcrumbs with the newly created document's ID.

const resaveSelfAfterCreate =
  (collection: CollectionConfig): CollectionAfterChangeHook =>
  async ({ doc, operation, req }) => {
    const { locale, payload } = req
    const { breadcrumbs = [] } = doc as DocWithBreadcrumbs

    if (operation === 'create') {
      const originalDocWithDepth0 = await payload.findByID({
        id: doc.id,
        collection: collection.slug,
        depth: 0,
        req,
      })

      const updateAsDraft =
        typeof collection.versions === 'object' &&
        collection.versions.drafts &&
        doc._status !== 'published'

      try {
        await payload.update({
          id: doc.id,
          collection: collection.slug,
          data: {
            ...originalDocWithDepth0,
            breadcrumbs:
              breadcrumbs?.map((crumb, i) => ({
                ...crumb,
                doc: breadcrumbs.length === i + 1 ? doc.id : crumb.doc,
              })) || [],
          },
          depth: 0,
          draft: updateAsDraft,
          locale,
          req,
        })
      } catch (err: unknown) {
        payload.logger.error(
          `Nested Docs plugin has had an error while adding breadcrumbs during document creation.`,
        )
        payload.logger.error(err)
      }
    }

    return undefined
  }

export default resaveSelfAfterCreate
