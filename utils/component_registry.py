"""
Component Registry System
Provides a centralized registry for all UI components with validation and documentation
Enables maintainable, self-documenting component library
"""

from typing import Dict, List, Any, Optional, Callable
from dataclasses import dataclass, field
from enum import Enum
import inspect
import json
from pathlib import Path


class ComponentType(Enum):
    """Component type classifications"""
    LAYOUT = "layout"
    NAVIGATION = "navigation"
    FORM = "form"
    DISPLAY = "display"
    INTERACTIVE = "interactive"
    GAMIFICATION = "gamification"
    LESSON = "lesson"
    DASHBOARD = "dashboard"
    MOBILE = "mobile"
    UTILITY = "utility"


class PropType(Enum):
    """Component property types for validation"""
    STRING = "string"
    INTEGER = "integer"
    BOOLEAN = "boolean"
    LIST = "list"
    DICT = "dict"
    OBJECT = "object"
    FUNCTION = "function"
    OPTIONAL = "optional"


@dataclass
class ComponentProp:
    """Component property definition"""
    name: str
    prop_type: PropType
    required: bool = True
    default: Any = None
    description: str = ""
    examples: List[str] = field(default_factory=list)
    validation_fn: Optional[Callable] = None
    
    def validate(self, value: Any) -> tuple[bool, str]:
        """Validate property value"""
        if value is None and self.required:
            return False, f"Required property '{self.name}' is missing"
        
        if value is None and not self.required:
            return True, ""
        
        # Type validation
        if self.prop_type == PropType.STRING and not isinstance(value, str):
            return False, f"Property '{self.name}' must be a string"
        elif self.prop_type == PropType.INTEGER and not isinstance(value, int):
            return False, f"Property '{self.name}' must be an integer"
        elif self.prop_type == PropType.BOOLEAN and not isinstance(value, bool):
            return False, f"Property '{self.name}' must be a boolean"
        elif self.prop_type == PropType.LIST and not isinstance(value, list):
            return False, f"Property '{self.name}' must be a list"
        elif self.prop_type == PropType.DICT and not isinstance(value, dict):
            return False, f"Property '{self.name}' must be a dictionary"
        
        # Custom validation
        if self.validation_fn:
            try:
                is_valid = self.validation_fn(value)
                if not is_valid:
                    return False, f"Property '{self.name}' failed custom validation"
            except Exception as e:
                return False, f"Property '{self.name}' validation error: {str(e)}"
        
        return True, ""


@dataclass
class ComponentInfo:
    """Complete component information"""
    name: str
    component_type: ComponentType
    template_path: str
    description: str
    props: List[ComponentProp] = field(default_factory=list)
    css_dependencies: List[str] = field(default_factory=list)
    js_dependencies: List[str] = field(default_factory=list)
    examples: List[Dict[str, Any]] = field(default_factory=list)
    tags: List[str] = field(default_factory=list)
    version: str = "1.0.0"
    author: str = "Code with Morais"
    created_date: str = ""
    last_modified: str = ""
    usage_count: int = 0
    performance_score: float = 0.0
    accessibility_score: float = 0.0
    mobile_optimized: bool = False
    
    def get_prop_by_name(self, name: str) -> Optional[ComponentProp]:
        """Get component property by name"""
        return next((prop for prop in self.props if prop.name == name), None)
    
    def validate_props(self, props: Dict[str, Any]) -> tuple[bool, List[str]]:
        """Validate all component properties"""
        errors = []
        
        for prop in self.props:
            value = props.get(prop.name)
            is_valid, error = prop.validate(value)
            if not is_valid:
                errors.append(error)
        
        return len(errors) == 0, errors
    
    def get_example_usage(self) -> str:
        """Get example Jinja2 template usage"""
        if not self.examples:
            return f"{{% include '{self.template_path}' %}}"
        
        example = self.examples[0]
        props_str = ", ".join([f"{k}={repr(v)}" for k, v in example.items()])
        return f"{{% include '{self.template_path}' with {props_str} %}}"


class ComponentRegistry:
    """Central registry for all UI components"""
    
    def __init__(self):
        self.components: Dict[str, ComponentInfo] = {}
        self._initialize_components()
    
    def _initialize_components(self):
        """Initialize registry with all available components"""
        # Core layout components
        self.register_component(ComponentInfo(
            name="skeleton_loader",
            component_type=ComponentType.UTILITY,
            template_path="components/common/skeleton-loader.html",
            description="Loading skeleton for better perceived performance",
            props=[
                ComponentProp("width", PropType.STRING, False, "100%", "Width of skeleton element"),
                ComponentProp("height", PropType.STRING, False, "20px", "Height of skeleton element"),
                ComponentProp("count", PropType.INTEGER, False, 1, "Number of skeleton lines"),
                ComponentProp("animation", PropType.BOOLEAN, False, True, "Enable pulse animation")
            ],
            css_dependencies=["css/components/skeleton.css"],
            examples=[
                {"width": "300px", "height": "40px", "count": 3},
                {"width": "100%", "height": "60px", "animation": False}
            ],
            tags=["loading", "performance", "ux"],
            mobile_optimized=True,
            performance_score=9.5,
            accessibility_score=8.0
        ))
        
        # Gamification components
        self.register_component(ComponentInfo(
            name="xp_animation",
            component_type=ComponentType.GAMIFICATION,
            template_path="components/gamification/xp-animation.html",
            description="Animated XP gain display with particle effects",
            props=[
                ComponentProp("xp_gained", PropType.INTEGER, True, None, "Amount of XP gained"),
                ComponentProp("animation_type", PropType.STRING, False, "burst", "Animation style"),
                ComponentProp("duration", PropType.INTEGER, False, 2000, "Animation duration in ms"),
                ComponentProp("color", PropType.STRING, False, "#4ade80", "XP color theme")
            ],
            css_dependencies=["css/components/gamification.css"],
            js_dependencies=["js/components/xp-animation.js"],
            examples=[
                {"xp_gained": 50, "animation_type": "burst"},
                {"xp_gained": 100, "color": "#f59e0b", "duration": 3000}
            ],
            tags=["gamification", "animation", "xp"],
            mobile_optimized=True,
            performance_score=8.5,
            accessibility_score=7.5
        ))
        
        self.register_component(ComponentInfo(
            name="achievement_toast",
            component_type=ComponentType.GAMIFICATION,
            template_path="components/gamification/achievement-toast.html",
            description="Achievement notification toast with animation",
            props=[
                ComponentProp("title", PropType.STRING, True, None, "Achievement title"),
                ComponentProp("description", PropType.STRING, False, "", "Achievement description"),
                ComponentProp("icon", PropType.STRING, False, "trophy", "FontAwesome icon name"),
                ComponentProp("rarity", PropType.STRING, False, "common", "Achievement rarity level"),
                ComponentProp("auto_hide", PropType.BOOLEAN, False, True, "Auto-hide after duration")
            ],
            css_dependencies=["css/components/gamification.css"],
            js_dependencies=["js/components/achievement-system.js"],
            examples=[
                {"title": "First Steps", "description": "Completed your first lesson", "icon": "star"},
                {"title": "Speed Demon", "rarity": "rare", "icon": "bolt"}
            ],
            tags=["gamification", "notification", "achievement"],
            mobile_optimized=True,
            performance_score=9.0,
            accessibility_score=8.5
        ))
        
        # Mobile components
        self.register_component(ComponentInfo(
            name="mobile_code_editor",
            component_type=ComponentType.MOBILE,
            template_path="components/lesson/mobile-code-editor.html",
            description="Touch-optimized code editor for mobile devices",
            props=[
                ComponentProp("editor_id", PropType.STRING, False, "main", "Unique editor identifier"),
                ComponentProp("language", PropType.STRING, False, "Python", "Programming language"),
                ComponentProp("initial_code", PropType.STRING, False, "", "Initial code content"),
                ComponentProp("placeholder", PropType.STRING, False, "# Start coding here...", "Placeholder text"),
                ComponentProp("readonly", PropType.BOOLEAN, False, False, "Read-only mode")
            ],
            css_dependencies=["css/components/responsive-enhancements.css"],
            js_dependencies=["js/components/mobile-code-editor.js"],
            examples=[
                {"editor_id": "lesson1", "language": "Python", "initial_code": "print('Hello, World!')"},
                {"editor_id": "challenge", "readonly": True}
            ],
            tags=["mobile", "editor", "touch", "responsive"],
            mobile_optimized=True,
            performance_score=8.8,
            accessibility_score=9.0
        ))
        
        # Dashboard components
        self.register_component(ComponentInfo(
            name="stat_card_modern",
            component_type=ComponentType.DASHBOARD,
            template_path="macros/dashboard.html",
            description="Modern statistical card with caching and animations",
            props=[
                ComponentProp("title", PropType.STRING, True, None, "Card title"),
                ComponentProp("value", PropType.STRING, True, None, "Main value to display"),
                ComponentProp("icon", PropType.STRING, False, "chart-bar", "FontAwesome icon"),
                ComponentProp("color", PropType.STRING, False, "primary", "Color theme"),
                ComponentProp("trend", PropType.STRING, False, "", "Trend indicator"),
                ComponentProp("cache_key", PropType.STRING, False, "", "Caching key for performance")
            ],
            css_dependencies=["css/components/dashboard.css"],
            js_dependencies=["js/components/dashboard.js"],
            examples=[
                {"title": "Total XP", "value": "1,250", "icon": "star", "trend": "+15%"},
                {"title": "Lessons", "value": "8", "color": "success", "icon": "book"}
            ],
            tags=["dashboard", "stats", "caching"],
            mobile_optimized=True,
            performance_score=9.2,
            accessibility_score=8.8
        ))
        
        # Form components
        self.register_component(ComponentInfo(
            name="form_input_modern",
            component_type=ComponentType.FORM,
            template_path="components/forms/modern-input.html",
            description="Modern form input with validation and accessibility",
            props=[
                ComponentProp("name", PropType.STRING, True, None, "Input name attribute"),
                ComponentProp("label", PropType.STRING, True, None, "Input label"),
                ComponentProp("type", PropType.STRING, False, "text", "Input type"),
                ComponentProp("required", PropType.BOOLEAN, False, False, "Required field"),
                ComponentProp("placeholder", PropType.STRING, False, "", "Placeholder text"),
                ComponentProp("validation", PropType.STRING, False, "", "Validation pattern")
            ],
            css_dependencies=["css/components/forms.css"],
            js_dependencies=["js/components/form-validation.js"],
            examples=[
                {"name": "email", "label": "Email Address", "type": "email", "required": True},
                {"name": "password", "label": "Password", "type": "password", "required": True}
            ],
            tags=["form", "input", "validation", "accessibility"],
            mobile_optimized=True,
            performance_score=9.0,
            accessibility_score=9.5
        ))
    
    def register_component(self, component: ComponentInfo):
        """Register a new component"""
        self.components[component.name] = component
    
    def get_component_info(self, name: str) -> Optional[ComponentInfo]:
        """Get component information by name"""
        return self.components.get(name)
    
    def list_components(self, component_type: Optional[ComponentType] = None, 
                       tags: Optional[List[str]] = None) -> List[ComponentInfo]:
        """List components by type or tags"""
        components = list(self.components.values())
        
        if component_type:
            components = [c for c in components if c.component_type == component_type]
        
        if tags:
            components = [c for c in components if any(tag in c.tags for tag in tags)]
        
        return sorted(components, key=lambda c: c.name)
    
    def validate_props(self, component_name: str, props: Dict[str, Any]) -> tuple[bool, List[str]]:
        """Validate component properties"""
        component = self.get_component_info(component_name)
        if not component:
            return False, [f"Component '{component_name}' not found"]
        
        return component.validate_props(props)
    
    def get_component_dependencies(self, component_name: str) -> Dict[str, List[str]]:
        """Get all dependencies for a component"""
        component = self.get_component_info(component_name)
        if not component:
            return {"css": [], "js": []}
        
        return {
            "css": component.css_dependencies,
            "js": component.js_dependencies
        }
    
    def get_mobile_optimized_components(self) -> List[ComponentInfo]:
        """Get all mobile-optimized components"""
        return [c for c in self.components.values() if c.mobile_optimized]
    
    def get_performance_report(self) -> Dict[str, Any]:
        """Get performance report for all components"""
        components = list(self.components.values())
        total_components = len(components)
        
        if total_components == 0:
            return {"total": 0, "average_performance": 0, "average_accessibility": 0}
        
        avg_performance = sum(c.performance_score for c in components) / total_components
        avg_accessibility = sum(c.accessibility_score for c in components) / total_components
        mobile_optimized_count = len(self.get_mobile_optimized_components())
        
        return {
            "total_components": total_components,
            "average_performance": round(avg_performance, 2),
            "average_accessibility": round(avg_accessibility, 2),
            "mobile_optimized_percentage": round((mobile_optimized_count / total_components) * 100, 1),
            "top_performers": sorted(components, key=lambda c: c.performance_score, reverse=True)[:3]
        }
    
    def export_documentation(self, format: str = "json") -> str:
        """Export component documentation"""
        if format == "json":
            return self._export_json()
        elif format == "markdown":
            return self._export_markdown()
        else:
            raise ValueError(f"Unsupported export format: {format}")
    
    def _export_json(self) -> str:
        """Export as JSON"""
        data = {
            "components": {
                name: {
                    "name": comp.name,
                    "type": comp.component_type.value,
                    "template_path": comp.template_path,
                    "description": comp.description,
                    "props": [
                        {
                            "name": prop.name,
                            "type": prop.prop_type.value,
                            "required": prop.required,
                            "default": prop.default,
                            "description": prop.description,
                            "examples": prop.examples
                        } for prop in comp.props
                    ],
                    "dependencies": {
                        "css": comp.css_dependencies,
                        "js": comp.js_dependencies
                    },
                    "examples": comp.examples,
                    "tags": comp.tags,
                    "mobile_optimized": comp.mobile_optimized,
                    "performance_score": comp.performance_score,
                    "accessibility_score": comp.accessibility_score
                } for name, comp in self.components.items()
            },
            "stats": self.get_performance_report()
        }
        return json.dumps(data, indent=2)
    
    def _export_markdown(self) -> str:
        """Export as Markdown documentation"""
        md = ["# Component Library Documentation\n"]
        md.append(f"**Total Components:** {len(self.components)}\n")
        
        # Group by type
        by_type = {}
        for comp in self.components.values():
            comp_type = comp.component_type.value
            if comp_type not in by_type:
                by_type[comp_type] = []
            by_type[comp_type].append(comp)
        
        for comp_type, components in sorted(by_type.items()):
            md.append(f"## {comp_type.title()} Components\n")
            
            for comp in sorted(components, key=lambda c: c.name):
                md.append(f"### {comp.name}\n")
                md.append(f"**Description:** {comp.description}\n")
                md.append(f"**Template:** `{comp.template_path}`\n")
                md.append(f"**Mobile Optimized:** {'✅' if comp.mobile_optimized else '❌'}\n")
                md.append(f"**Performance Score:** {comp.performance_score}/10\n")
                md.append(f"**Accessibility Score:** {comp.accessibility_score}/10\n")
                
                if comp.props:
                    md.append("**Properties:**\n")
                    for prop in comp.props:
                        required = "Required" if prop.required else "Optional"
                        md.append(f"- `{prop.name}` ({prop.prop_type.value}, {required}): {prop.description}\n")
                
                if comp.examples:
                    md.append("**Example Usage:**\n")
                    md.append(f"```jinja2\n{comp.get_example_usage()}\n```\n")
                
                md.append("---\n")
        
        return "".join(md)
    
    def search_components(self, query: str) -> List[ComponentInfo]:
        """Search components by name, description, or tags"""
        query = query.lower()
        results = []
        
        for component in self.components.values():
            if (query in component.name.lower() or 
                query in component.description.lower() or
                any(query in tag.lower() for tag in component.tags)):
                results.append(component)
        
        return sorted(results, key=lambda c: c.name)


# Global registry instance
component_registry = ComponentRegistry()


def get_component_info(name: str) -> Optional[ComponentInfo]:
    """Get component information - shorthand function"""
    return component_registry.get_component_info(name)


def validate_props(component_name: str, props: Dict[str, Any]) -> tuple[bool, List[str]]:
    """Validate component properties - shorthand function"""
    return component_registry.validate_props(component_name, props)


def list_components(component_type: Optional[ComponentType] = None) -> List[ComponentInfo]:
    """List components - shorthand function"""
    return component_registry.list_components(component_type)
