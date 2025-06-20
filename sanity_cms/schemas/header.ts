import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'header',
  title: 'Header',
  type: 'document',
  fields: [
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          validation: Rule => Rule.required()
        })
      ]
    }),
    defineField({
      name: 'storeName',
      title: 'Store Name',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'logoHeight',
      title: 'Logo Height (px)',
      type: 'number',
      description: 'Set the height of the logo in pixels (24-64px recommended)',
      validation: Rule => Rule.min(24).max(64),
      initialValue: 36,
    }),
    defineField({
      name: 'navigation',
      title: 'Navigation',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              title: 'Name',
              type: 'string',
              validation: Rule => Rule.required()
            }),
            defineField({
              name: 'href',
              title: 'Link',
              type: 'string',
              validation: Rule => Rule.required()
            })
          ]
        }
      ]
    }),
    defineField({
      name: 'marquee',
      title: 'Marquee',
      type: 'object',
      fields: [
        defineField({
          name: 'enabled',
          title: 'Enabled',
          type: 'boolean',
          initialValue: false
        }),
        defineField({
          name: 'text1',
          title: 'Text 1',
          type: 'object',
          fields: [
            defineField({
              name: 'enabled',
              title: 'Enabled',
              type: 'boolean',
              initialValue: true
            }),
            defineField({
              name: 'content',
              title: 'Content',
              type: 'string',
              validation: Rule => Rule.max(50)
            })
          ]
        }),
        defineField({
          name: 'text2',
          title: 'Text 2',
          type: 'object',
          fields: [
            defineField({
              name: 'enabled',
              title: 'Enabled',
              type: 'boolean',
              initialValue: false
            }),
            defineField({
              name: 'content',
              title: 'Content',
              type: 'string',
              validation: Rule => Rule.max(50)
            })
          ]
        }),
        defineField({
          name: 'text3',
          title: 'Text 3',
          type: 'object',
          fields: [
            defineField({
              name: 'enabled',
              title: 'Enabled',
              type: 'boolean',
              initialValue: false
            }),
            defineField({
              name: 'content',
              title: 'Content',
              type: 'string',
              validation: Rule => Rule.max(50)
            })
          ]
        }),
        defineField({
          name: 'linkUrl',
          title: 'Link URL',
          type: 'string'
        }),
        defineField({
          name: 'pauseOnHover',
          title: 'Pause on Hover',
          type: 'boolean',
          initialValue: true
        })
      ]
    })
  ]
})
