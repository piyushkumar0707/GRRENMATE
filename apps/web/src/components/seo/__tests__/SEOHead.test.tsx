// Tests for SEO components
import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SocialShare, BreadcrumbNav } from '../SEOHead'

// Mock next/head
jest.mock('next/head', () => {
  return {
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => {
      return <div data-testid="head">{children}</div>
    },
  }
})

describe('SEOHead Components', () => {
  describe('SocialShare', () => {
    const mockShareData = {
      url: 'https://greenmate.app/plants/monstera',
      title: 'Monstera Care Guide',
      description: 'Learn how to care for your Monstera plant',
      image: 'https://example.com/monstera.jpg',
      hashtags: ['PlantCare', 'Monstera']
    }

    beforeEach(() => {
      // Mock window.open
      global.open = jest.fn()
      
      // Mock navigator.clipboard
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn(() => Promise.resolve())
        }
      })
      
      // Mock navigator.share
      Object.assign(navigator, {
        share: jest.fn(() => Promise.resolve())
      })
    })

    it('should render all social sharing buttons', () => {
      render(<SocialShare data={mockShareData} />)
      
      expect(screen.getByLabelText('Share on Twitter')).toBeInTheDocument()
      expect(screen.getByLabelText('Share on Facebook')).toBeInTheDocument()
      expect(screen.getByLabelText('Share on LinkedIn')).toBeInTheDocument()
      expect(screen.getByLabelText('Share on Pinterest')).toBeInTheDocument()
      expect(screen.getByLabelText('Share on WhatsApp')).toBeInTheDocument()
      expect(screen.getByLabelText('Copy link to clipboard')).toBeInTheDocument()
    })

    it('should render native share button when supported', () => {
      render(<SocialShare data={mockShareData} />)
      
      if (navigator.share) {
        expect(screen.getByLabelText('Share via system dialog')).toBeInTheDocument()
      }
    })

    it('should not render Pinterest button when no image provided', () => {
      const dataWithoutImage = {
        ...mockShareData,
        image: undefined
      }
      
      render(<SocialShare data={dataWithoutImage} />)
      
      expect(screen.queryByLabelText('Share on Pinterest')).not.toBeInTheDocument()
    })

    it('should open Twitter share window when Twitter button clicked', async () => {
      const user = userEvent.setup()
      render(<SocialShare data={mockShareData} />)
      
      const twitterButton = screen.getByLabelText('Share on Twitter')
      await user.click(twitterButton)
      
      expect(global.open).toHaveBeenCalledWith(
        expect.stringContaining('twitter.com/intent/tweet'),
        '_blank',
        'width=600,height=400,scrollbars=yes,resizable=yes'
      )
    })

    it('should copy link to clipboard when copy button clicked', async () => {
      const user = userEvent.setup()
      render(<SocialShare data={mockShareData} />)
      
      const copyButton = screen.getByLabelText('Copy link to clipboard')
      await user.click(copyButton)
      
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockShareData.url)
    })

    it('should use native share API when native button clicked', async () => {
      const user = userEvent.setup()
      render(<SocialShare data={mockShareData} />)
      
      const nativeShareButton = screen.queryByLabelText('Share via system dialog')
      if (nativeShareButton) {
        await user.click(nativeShareButton)
        
        expect(navigator.share).toHaveBeenCalledWith({
          title: mockShareData.title,
          text: mockShareData.description,
          url: mockShareData.url
        })
      }
    })

    it('should render without labels when showLabels is false', () => {
      render(<SocialShare data={mockShareData} showLabels={false} />)
      
      expect(screen.queryByText('Share:')).not.toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = render(
        <SocialShare data={mockShareData} className="custom-class" />
      )
      
      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('BreadcrumbNav', () => {
    const mockBreadcrumbItems = [
      { name: 'Home', url: '/' },
      { name: 'Plants', url: '/plants' },
      { name: 'Monstera', url: '/plants/monstera' }
    ]

    it('should render breadcrumb navigation', () => {
      render(<BreadcrumbNav items={mockBreadcrumbItems} />)
      
      expect(screen.getByRole('navigation')).toBeInTheDocument()
      expect(screen.getByLabelText('Breadcrumb')).toBeInTheDocument()
    })

    it('should render all breadcrumb items', () => {
      render(<BreadcrumbNav items={mockBreadcrumbItems} />)
      
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Plants')).toBeInTheDocument()
      expect(screen.getByText('Monstera')).toBeInTheDocument()
    })

    it('should render links for non-current items', () => {
      render(<BreadcrumbNav items={mockBreadcrumbItems} />)
      
      const homeLink = screen.getByRole('link', { name: 'Home' })
      const plantsLink = screen.getByRole('link', { name: 'Plants' })
      
      expect(homeLink).toHaveAttribute('href', '/')
      expect(plantsLink).toHaveAttribute('href', '/plants')
    })

    it('should render current page as text, not link', () => {
      render(<BreadcrumbNav items={mockBreadcrumbItems} />)
      
      const currentItem = screen.getByText('Monstera')
      expect(currentItem).toHaveAttribute('aria-current', 'page')
      expect(currentItem.tagName).toBe('SPAN')
    })

    it('should render separators between items', () => {
      render(<BreadcrumbNav items={mockBreadcrumbItems} />)
      
      // Should have 2 separators for 3 items
      const separators = screen.getAllByRole('generic').filter(el => 
        el.querySelector('svg')
      )
      expect(separators).toHaveLength(2)
    })

    it('should apply custom className', () => {
      const { container } = render(
        <BreadcrumbNav items={mockBreadcrumbItems} className="custom-breadcrumb" />
      )
      
      expect(container.firstChild).toHaveClass('custom-breadcrumb')
    })

    it('should handle single item', () => {
      const singleItem = [{ name: 'Home', url: '/' }]
      render(<BreadcrumbNav items={singleItem} />)
      
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.queryByRole('generic')).not.toBeInTheDocument() // No separator
    })

    it('should handle empty items array', () => {
      render(<BreadcrumbNav items={[]} />)
      
      expect(screen.getByRole('navigation')).toBeInTheDocument()
      expect(screen.queryByText('Home')).not.toBeInTheDocument()
    })
  })
})