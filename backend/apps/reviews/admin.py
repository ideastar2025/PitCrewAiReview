from django.contrib import admin
from django.utils.html import format_html
from .models import PullRequest, AIReview, ReviewIssue

# ... rest of the file remains the same


from django.contrib import admin
from django.utils.html import format_html
from .models import PullRequest, AIReview, ReviewIssue


@admin.register(PullRequest)
class PullRequestAdmin(admin.ModelAdmin):
    """Admin interface for Pull Requests"""
    
    list_display = [
        'pr_number',
        'title_short',
        'repository',
        'author',
        'status',
        'risk_badge',
        'deployment_status',
        'created_at'
    ]
    
    list_filter = [
        'status',
        'repository__provider',
        'created_at',
        'ai_review__deployment_ready'
    ]
    
    search_fields = [
        'title',
        'description',
        'author',
        'pr_number'
    ]
    
    readonly_fields = [
        'pr_number',
        'url',
        'created_at',
        'updated_at',
        'view_pr_link'
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('repository', 'pr_number', 'title', 'description')
        }),
        ('PR Details', {
            'fields': ('author', 'status', 'source_branch', 'target_branch', 'url')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def title_short(self, obj):
        """Display truncated title"""
        return obj.title[:50] + '...' if len(obj.title) > 50 else obj.title
    title_short.short_description = 'Title'
    
    def risk_badge(self, obj):
        """Display risk score as colored badge"""
        if not hasattr(obj, 'ai_review') or not obj.ai_review:
            return format_html(
                '<span style="color: gray;">No Review</span>'
            )
        
        score = obj.ai_review.risk_score
        if score < 30:
            color = '#28a745'  # Green
            label = 'Low'
        elif score < 70:
            color = '#ffc107'  # Yellow
            label = 'Medium'
        else:
            color = '#dc3545'  # Red
            label = 'High'
        
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; '
            'border-radius: 3px; font-weight: bold;">{} ({})</span>',
            color, label, score
        )
    risk_badge.short_description = 'Risk'
    
    def deployment_status(self, obj):
        """Display deployment ready status"""
        if not hasattr(obj, 'ai_review') or not obj.ai_review:
            return '—'
        
        if obj.ai_review.deployment_ready:
            return format_html(
                '<span style="color: #28a745;">✓ Ready</span>'
            )
        return format_html(
            '<span style="color: #dc3545;">✗ Not Ready</span>'
        )
    deployment_status.short_description = 'Deployment'
    
    def view_pr_link(self, obj):
        """Display link to PR"""
        if obj.url:
            return format_html(
                '<a href="{}" target="_blank">View on {}</a>',
                obj.url,
                obj.repository.provider.title()
            )
        return '—'
    view_pr_link.short_description = 'External Link'


class ReviewIssueInline(admin.TabularInline):
    """Inline admin for review issues"""
    model = ReviewIssue
    extra = 0
    readonly_fields = ['severity', 'title', 'file_path', 'line_number', 'suggestion']
    can_delete = False
    
    def has_add_permission(self, request, obj=None):
        return False


@admin.register(AIReview)
class AIReviewAdmin(admin.ModelAdmin):
    """Admin interface for AI Reviews"""
    
    list_display = [
        'pull_request',
        'risk_badge',
        'deployment_badge',
        'issues_count',
        'created_at'
    ]
    
    list_filter = [
        'deployment_ready',
        'created_at',
        'risk_score'
    ]
    
    search_fields = [
        'pull_request__title',
        'summary'
    ]
    
    readonly_fields = [
        'pull_request',
        'risk_score',
        'summary',
        'deployment_ready',
        'analysis_data',
        'created_at',
        'formatted_summary',
        'recommendations_display',
        'blockers_display'
    ]
    
    inlines = [ReviewIssueInline]
    
    fieldsets = (
        ('Review Overview', {
            'fields': ('pull_request', 'risk_score', 'deployment_ready', 'created_at')
        }),
        ('Analysis', {
            'fields': ('formatted_summary', 'recommendations_display', 'blockers_display')
        }),
        ('Raw Data', {
            'fields': ('analysis_data',),
            'classes': ('collapse',)
        }),
    )
    
    def risk_badge(self, obj):
        """Display risk score as colored badge"""
        score = obj.risk_score
        if score < 30:
            color = '#28a745'
            label = 'Low Risk'
        elif score < 70:
            color = '#ffc107'
            label = 'Medium Risk'
        else:
            color = '#dc3545'
            label = 'High Risk'
        
        return format_html(
            '<span style="background-color: {}; color: white; padding: 5px 12px; '
            'border-radius: 3px; font-weight: bold;">{} ({})</span>',
            color, label, score
        )
    risk_badge.short_description = 'Risk Score'
    
    def deployment_badge(self, obj):
        """Display deployment ready status as badge"""
        if obj.deployment_ready:
            return format_html(
                '<span style="background-color: #28a745; color: white; padding: 5px 12px; '
                'border-radius: 3px; font-weight: bold;">✓ Ready</span>'
            )
        return format_html(
            '<span style="background-color: #dc3545; color: white; padding: 5px 12px; '
            'border-radius: 3px; font-weight: bold;">✗ Not Ready</span>'
        )
    deployment_badge.short_description = 'Deployment'
    
    def issues_count(self, obj):
        """Display count of issues by severity"""
        high = obj.issues.filter(severity='high').count()
        medium = obj.issues.filter(severity='medium').count()
        low = obj.issues.filter(severity='low').count()
        
        return format_html(
            '<span style="color: #dc3545;">🔴 {}</span> | '
            '<span style="color: #ffc107;">🟡 {}</span> | '
            '<span style="color: #28a745;">🟢 {}</span>',
            high, medium, low
        )
    issues_count.short_description = 'Issues (H/M/L)'
    
    def formatted_summary(self, obj):
        """Display formatted summary"""
        return format_html('<p style="white-space: pre-wrap;">{}</p>', obj.summary)
    formatted_summary.short_description = 'Summary'
    
    def recommendations_display(self, obj):
        """Display recommendations as list"""
        recommendations = obj.analysis_data.get('recommendations', [])
        if not recommendations:
            return '—'
        
        items = ''.join([f'<li>{rec}</li>' for rec in recommendations])
        return format_html('<ul>{}</ul>', items)
    recommendations_display.short_description = 'Recommendations'
    
    def blockers_display(self, obj):
        """Display blockers as list"""
        blockers = obj.analysis_data.get('blockers', [])
        if not blockers:
            return format_html('<span style="color: #28a745;">No blockers</span>')
        
        items = ''.join([f'<li style="color: #dc3545;">{blocker}</li>' for blocker in blockers])
        return format_html('<ul>{}</ul>', items)
    blockers_display.short_description = 'Blockers'


@admin.register(ReviewIssue)
class ReviewIssueAdmin(admin.ModelAdmin):
    """Admin interface for Review Issues"""
    
    list_display = [
        'severity_badge',
        'title_short',
        'file_path_short',
        'line_number',
        'pull_request_link',
        'created_at'
    ]
    
    list_filter = [
        'severity',
        'created_at',
        'ai_review__pull_request__repository'
    ]
    
    search_fields = [
        'title',
        'file_path',
        'suggestion'
    ]
    
    readonly_fields = [
        'ai_review',
        'severity',
        'title',
        'file_path',
        'line_number',
        'suggestion',
        'created_at',
        'formatted_suggestion'
    ]
    
    fieldsets = (
        ('Issue Details', {
            'fields': ('ai_review', 'severity', 'title')
        }),
        ('Location', {
            'fields': ('file_path', 'line_number')
        }),
        ('Suggestion', {
            'fields': ('formatted_suggestion',)
        }),
        ('Metadata', {
            'fields': ('created_at',)
        }),
    )
    
    def severity_badge(self, obj):
        """Display severity as colored badge"""
        colors = {
            'high': '#dc3545',
            'medium': '#ffc107',
            'low': '#28a745'
        }
        color = colors.get(obj.severity, '#6c757d')
        
        return format_html(
            '<span style="background-color: {}; color: white; padding: 5px 12px; '
            'border-radius: 3px; font-weight: bold;">{}</span>',
            color, obj.severity.upper()
        )
    severity_badge.short_description = 'Severity'
    
    def title_short(self, obj):
        """Display truncated title"""
        return obj.title[:60] + '...' if len(obj.title) > 60 else obj.title
    title_short.short_description = 'Title'
    
    def file_path_short(self, obj):
        """Display truncated file path"""
        path = obj.file_path
        if len(path) > 50:
            parts = path.split('/')
            if len(parts) > 2:
                return f".../{'/'.join(parts[-2:])}"
        return path
    file_path_short.short_description = 'File'
    
    def pull_request_link(self, obj):
        """Link to related PR"""
        pr = obj.ai_review.pull_request
        return format_html(
            '<a href="/admin/reviews/pullrequest/{}/change/">PR #{}</a>',
            pr.id, pr.pr_number
        )
    pull_request_link.short_description = 'Pull Request'
    
    def formatted_suggestion(self, obj):
        """Display formatted suggestion"""
        return format_html('<p style="white-space: pre-wrap;">{}</p>', obj.suggestion)
    formatted_suggestion.short_description = 'Suggestion'


# Customize admin site header
admin.site.site_header = 'PitCrew AI Administration'
admin.site.site_title = 'PitCrew AI Admin'
admin.site.index_title = 'Dashboard'