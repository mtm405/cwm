"""
Documentation Routes
Provides access to component documentation and testing interface
"""

from flask import Blueprint, render_template, jsonify, request
from utils.component_registry import component_registry, ComponentType
import json

docs_bp = Blueprint('docs', __name__, url_prefix='/docs')


@docs_bp.route('/')
def component_showcase():
    """Main component documentation page"""
    try:
        # Get all components from registry
        components = list(component_registry.components.values())
        
        # Get performance statistics
        component_stats = component_registry.get_performance_report()
        
        return render_template(
            'components/_docs/component-showcase.html',
            components=components,
            component_stats=component_stats,
            page_title="Component Library Documentation"
        )
    except Exception as e:
        print(f"Error loading component showcase: {e}")
        return render_template(
            'components/_docs/component-showcase.html',
            components=[],
            component_stats={
                'total_components': 0,
                'mobile_optimized_percentage': 0,
                'average_performance': 0,
                'average_accessibility': 0
            },
            error_message="Failed to load component documentation"
        )


@docs_bp.route('/api/components')
def component_registry_api():
    """API endpoint for component registry data"""
    try:
        component_type = request.args.get('type')
        tags = request.args.getlist('tags')
        mobile_only = request.args.get('mobile_only', 'false').lower() == 'true'
        search_query = request.args.get('search', '')
        
        # Get components based on filters
        components = list(component_registry.components.values())
        
        # Filter by type
        if component_type:
            try:
                filter_type = ComponentType(component_type)
                components = [c for c in components if c.component_type == filter_type]
            except ValueError:
                pass
        
        # Filter by tags
        if tags:
            components = [c for c in components if any(tag in c.tags for tag in tags)]
        
        # Filter mobile-optimized only
        if mobile_only:
            components = [c for c in components if c.mobile_optimized]
        
        # Search filter
        if search_query:
            search_query = search_query.lower()
            components = [
                c for c in components 
                if (search_query in c.name.lower() or 
                    search_query in c.description.lower() or
                    any(search_query in tag.lower() for tag in c.tags))
            ]
        
        # Sort components
        sort_by = request.args.get('sort', 'name')
        if sort_by == 'performance':
            components.sort(key=lambda c: c.performance_score, reverse=True)
        elif sort_by == 'accessibility':
            components.sort(key=lambda c: c.accessibility_score, reverse=True)
        elif sort_by == 'usage':
            components.sort(key=lambda c: c.usage_count, reverse=True)
        else:
            components.sort(key=lambda c: c.name)
        
        # Convert to serializable format
        components_data = []
        for comp in components:
            comp_data = {
                'name': comp.name,
                'component_type': comp.component_type.value,
                'template_path': comp.template_path,
                'description': comp.description,
                'props': [
                    {
                        'name': prop.name,
                        'prop_type': prop.prop_type.value,
                        'required': prop.required,
                        'default': prop.default,
                        'description': prop.description,
                        'examples': prop.examples
                    } for prop in comp.props
                ],
                'css_dependencies': comp.css_dependencies,
                'js_dependencies': comp.js_dependencies,
                'examples': comp.examples,
                'tags': comp.tags,
                'version': comp.version,
                'mobile_optimized': comp.mobile_optimized,
                'performance_score': comp.performance_score,
                'accessibility_score': comp.accessibility_score,
                'usage_count': comp.usage_count
            }
            components_data.append(comp_data)
        
        return jsonify({
            'success': True,
            'components': components_data,
            'total': len(components_data),
            'stats': component_registry.get_performance_report()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'components': [],
            'total': 0
        }), 500


@docs_bp.route('/api/components/<component_name>')
def get_component_details(component_name):
    """Get detailed information about a specific component"""
    try:
        component = component_registry.get_component_info(component_name)
        
        if not component:
            return jsonify({
                'success': False,
                'error': f'Component "{component_name}" not found'
            }), 404
        
        # Get component dependencies
        dependencies = component_registry.get_component_dependencies(component_name)
        
        component_data = {
            'name': component.name,
            'component_type': component.component_type.value,
            'template_path': component.template_path,
            'description': component.description,
            'props': [
                {
                    'name': prop.name,
                    'prop_type': prop.prop_type.value,
                    'required': prop.required,
                    'default': prop.default,
                    'description': prop.description,
                    'examples': prop.examples
                } for prop in component.props
            ],
            'dependencies': dependencies,
            'examples': component.examples,
            'tags': component.tags,
            'version': component.version,
            'author': component.author,
            'mobile_optimized': component.mobile_optimized,
            'performance_score': component.performance_score,
            'accessibility_score': component.accessibility_score,
            'usage_count': component.usage_count,
            'example_usage': component.get_example_usage()
        }
        
        return jsonify({
            'success': True,
            'component': component_data
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@docs_bp.route('/api/components/<component_name>/test', methods=['POST'])
def component_test_api(component_name):
    """Test component with provided properties"""
    try:
        component = component_registry.get_component_info(component_name)
        
        if not component:
            return jsonify({
                'success': False,
                'error': f'Component "{component_name}" not found'
            }), 404
        
        # Get test properties from request
        test_props = request.get_json() or {}
        
        # Validate properties
        is_valid, errors = component.validate_props(test_props)
        
        if not is_valid:
            return jsonify({
                'success': False,
                'error': 'Invalid properties',
                'validation_errors': errors
            }), 400
        
        # Generate test code
        props_str = ", ".join([f"{k}={repr(v)}" for k, v in test_props.items()])
        test_code = f"{% include '{component.template_path}' with {props_str} %}"
        
        # TODO: Implement actual component rendering
        # For now, return the code that would be used
        
        return jsonify({
            'success': True,
            'test_code': test_code,
            'validated_props': test_props,
            'dependencies': component_registry.get_component_dependencies(component_name)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@docs_bp.route('/api/export')
def export_documentation():
    """Export component documentation in various formats"""
    try:
        export_format = request.args.get('format', 'json')
        
        if export_format not in ['json', 'markdown']:
            return jsonify({
                'success': False,
                'error': 'Unsupported format. Use "json" or "markdown"'
            }), 400
        
        documentation = component_registry.export_documentation(export_format)
        
        if export_format == 'json':
            return jsonify({
                'success': True,
                'format': 'json',
                'data': json.loads(documentation)
            })
        else:
            return jsonify({
                'success': True,
                'format': 'markdown',
                'data': documentation
            })
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@docs_bp.route('/api/search')
def search_components():
    """Search components by query"""
    try:
        query = request.args.get('q', '').strip()
        
        if not query:
            return jsonify({
                'success': False,
                'error': 'Search query is required'
            }), 400
        
        # Search components
        results = component_registry.search_components(query)
        
        # Convert to serializable format
        results_data = []
        for comp in results:
            comp_data = {
                'name': comp.name,
                'component_type': comp.component_type.value,
                'description': comp.description,
                'tags': comp.tags,
                'mobile_optimized': comp.mobile_optimized,
                'performance_score': comp.performance_score,
                'accessibility_score': comp.accessibility_score
            }
            results_data.append(comp_data)
        
        return jsonify({
            'success': True,
            'query': query,
            'results': results_data,
            'total': len(results_data)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@docs_bp.route('/api/stats')
def get_component_stats():
    """Get component library statistics"""
    try:
        stats = component_registry.get_performance_report()
        
        # Add additional statistics
        components = list(component_registry.components.values())
        
        # Component type distribution
        type_distribution = {}
        for comp in components:
            comp_type = comp.component_type.value
            type_distribution[comp_type] = type_distribution.get(comp_type, 0) + 1
        
        # Tag popularity
        tag_count = {}
        for comp in components:
            for tag in comp.tags:
                tag_count[tag] = tag_count.get(tag, 0) + 1
        
        popular_tags = sorted(tag_count.items(), key=lambda x: x[1], reverse=True)[:10]
        
        enhanced_stats = {
            **stats,
            'type_distribution': type_distribution,
            'popular_tags': popular_tags,
            'total_dependencies': {
                'css': sum(len(c.css_dependencies) for c in components),
                'js': sum(len(c.js_dependencies) for c in components)
            }
        }
        
        return jsonify({
            'success': True,
            'stats': enhanced_stats
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# Register the blueprint in your main app
def register_docs_routes(app):
    """Register documentation routes with the Flask app"""
    app.register_blueprint(docs_bp)
